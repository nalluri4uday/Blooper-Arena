import { NextResponse } from 'next/server';
import { getMarketStatus } from '@blooper-arena/trading-engine';

export async function GET() {
  const status = getMarketStatus();

  return NextResponse.json(status, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
