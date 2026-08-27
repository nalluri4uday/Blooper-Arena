import Fastify from 'fastify';
import cors from '@fastify/cors';
import cron from 'node-cron';
import { createPooledDb } from '@blooper-arena/database/client';
import { healthRoute } from './routes/health.js';
import { triggerTickRoute } from './routes/trigger-tick.js';
import { processTickBatch } from './jobs/tick-processor.js';
import { calculateLeaderboard } from './jobs/leaderboard-calculator.js';
import { replenishEnergy } from './jobs/energy-replenisher.js';
import { expireDecisions } from './jobs/decision-expirer.js';

const PORT = parseInt(process.env.WORKER_PORT || '3001', 10);
const API_KEY = process.env.WORKER_API_KEY || 'dev-api-key';

const app = Fastify({ logger: true });

// Database connection
const db = createPooledDb(process.env.DATABASE_URL!);

// CORS
await app.register(cors, { origin: true });

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
app.register(triggerTickRoute, { prefix: '/admin' });

// Cron jobs
// Tick processing: every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  app.log.info('Running tick processing...');
  try {
    const processed = await processTickBatch(db);
    app.log.info(`Tick processing complete. Processed ${processed} players.`);
  } catch (err) {
    app.log.error(err, 'Tick processing failed');
  }
});

// Energy replenishment & decision expiry: every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  app.log.info('Running energy replenishment and decision expiry...');
  try {
    await Promise.all([replenishEnergy(db), expireDecisions(db)]);
    app.log.info('Energy/decision jobs complete.');
  } catch (err) {
    app.log.error(err, 'Energy/decision jobs failed');
  }
});

// Leaderboard calculation: every hour
cron.schedule('0 * * * *', async () => {
  app.log.info('Calculating leaderboard...');
  try {
    await calculateLeaderboard(db);
    app.log.info('Leaderboard calculation complete.');
  } catch (err) {
    app.log.error(err, 'Leaderboard calculation failed');
  }
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
