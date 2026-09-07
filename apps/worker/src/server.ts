import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === 'production',
});

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import cron from 'node-cron';
import { createPooledDb } from '@blooper-arena/database/client';
import { healthRoute } from './routes/health.js';
import { runPriceFetcher } from './jobs/price-fetcher.js';
import { runPortfolioCalculator } from './jobs/portfolio-calculator.js';
import { runLeaderboardCalculator } from './jobs/leaderboard-calculator.js';
import { runSnapshotCleaner } from './jobs/snapshot-cleaner.js';
import { runStockSeeder } from './jobs/seed-stocks.js';

const PORT = parseInt(process.env.WORKER_PORT || '3001', 10);
const API_KEY = process.env.WORKER_API_KEY || 'dev-api-key';

const app = Fastify({ logger: true });

// Database connection
const db = createPooledDb(process.env.DATABASE_URL!);

// CORS
await app.register(cors, { origin: true });

// Rate limiting
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

// Decorate with db and api key for routes
app.decorate('db', db);
app.decorate('apiKey', API_KEY);

// Auth hook for admin routes
app.addHook('onRequest', async (request, reply) => {
  if (request.url.startsWith('/admin')) {
    const authHeader = request.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  }
});

// Routes
app.register(healthRoute);

// Admin: Seed stocks
app.post('/admin/seed-stocks', async (_request, reply) => {
  await runStockSeeder(db);
  reply.send({ success: true, message: 'Stock seeding complete' });
});

// Admin: Trigger price fetch
app.post('/admin/fetch-prices', async (_request, reply) => {
  await runPriceFetcher(db);
  reply.send({ success: true, message: 'Price fetch complete' });
});

// Admin: Trigger portfolio recalculation
app.post('/admin/recalculate', async (_request, reply) => {
  await runPortfolioCalculator(db);
  await runLeaderboardCalculator(db);
  reply.send({ success: true, message: 'Recalculation complete' });
});

// Cron Jobs
// Price fetcher: every 15 minutes
cron.schedule('*/15 * * * *', () => {
  runPriceFetcher(db).catch(err => console.error('Price fetcher cron error:', err));
});

// Portfolio calculator: every 15 minutes (offset by 2 min from price fetcher)
cron.schedule('2,17,32,47 * * * *', () => {
  runPortfolioCalculator(db).catch(err => console.error('Portfolio calculator cron error:', err));
});

// Leaderboard calculator: every 30 minutes
cron.schedule('5,35 * * * *', () => {
  runLeaderboardCalculator(db).catch(err => console.error('Leaderboard calculator cron error:', err));
});

// Snapshot cleaner: daily at midnight UTC
cron.schedule('0 0 * * *', () => {
  runSnapshotCleaner(db).catch(err => console.error('Snapshot cleaner cron error:', err));
});

// Self-ping to prevent Render free tier sleep: every 5 minutes
cron.schedule('*/5 * * * *', () => {
  const selfUrl = process.env.WORKER_URL;
  if (selfUrl) {
    fetch(`${selfUrl}/health`).catch(() => {});
  }
});

// Start server
try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  app.log.info(`Worker listening on port ${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
