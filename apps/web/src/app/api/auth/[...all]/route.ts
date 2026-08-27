import { getAuth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { GET: handler } = toNextJsHandler(getAuth());
  return handler(request);
}

export async function POST(request: NextRequest) {
  const { POST: handler } = toNextJsHandler(getAuth());
  return handler(request);
}
