import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { seasons } from './schema/seasons';
import { eq } from 'drizzle-orm';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
config({ path: resolve(__dirname, '../../../.env') });

const db = drizzle(process.env.DATABASE_URL!);
await db.update(seasons).set({ status: 'active' }).where(eq(seasons.status, 'registration'));
console.log('Season 1 activated');
process.exit(0);
