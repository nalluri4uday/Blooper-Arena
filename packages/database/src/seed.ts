import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { seasons } from './schema/seasons';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
config({ path: resolve(__dirname, '../../../.env') });

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const db = drizzle(connectionString);

  console.log('Seeding database...');

  // Create the first season
  const now = new Date();
  const startsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // starts tomorrow
  const endsAt = new Date(startsAt.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(seasons).values({
    id: crypto.randomUUID(),
    name: 'Season 1: The Beginning',
    status: 'registration',
    ruleVersion: 'v1',
    seed: crypto.randomUUID(),
    startingCapital: 100_000,
    targetNetWorth: 10_000_000,
    maxPlayers: 10_000,
    tickIntervalMinutes: 30,
    startsAt,
    endsAt,
  });

  console.log('Created Season 1 (registration open, starts tomorrow)');
  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
