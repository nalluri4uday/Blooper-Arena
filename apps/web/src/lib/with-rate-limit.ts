import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { checkRateLimit, type RateLimitConfig } from './rate-limit';

export async function applyRateLimit(
  config: RateLimitConfig = { windowMs: 60_000, maxRequests: 30 },
): Promise<NextResponse | null> {
  const hdrs = await headers();
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || hdrs.get('x-real-ip') || 'unknown';
  const result = checkRateLimit(ip, config);

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  return null;
}
