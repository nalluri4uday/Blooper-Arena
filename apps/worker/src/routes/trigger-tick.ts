import type { FastifyPluginAsync } from 'fastify';
import { processTickBatch } from '../jobs/tick-processor.js';
import { calculateLeaderboard } from '../jobs/leaderboard-calculator.js';

export const triggerTickRoute: FastifyPluginAsync = async (app) => {
  app.post('/tick', async (request, reply) => {
    const db = (app as any).db;
    const processed = await processTickBatch(db);
    return { processed };
  });

  app.post('/leaderboard', async (request, reply) => {
    const db = (app as any).db;
    await calculateLeaderboard(db);
    return { recalculated: true };
  });
};
