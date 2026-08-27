import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDb } from './db';

function createAuth() {
  return betterAuth({
    database: drizzleAdapter(getDb(), { provider: 'pg' }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
  });
}

let _auth: ReturnType<typeof createAuth>;

export function getAuth() {
  if (!_auth) {
    _auth = createAuth();
  }
  return _auth;
}
