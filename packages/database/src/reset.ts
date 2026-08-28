import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
config({ path: resolve(__dirname, '../../../.env') });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
console.log('Schema reset — all tables dropped');
await pool.end();
