import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { stocks } from '@blooper-arena/database/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const market = searchParams.get('market') || 'all';

  const db = getDb();

  const query = db.select().from(stocks).where(eq(stocks.isActive, true));

  const allStocks = await query.orderBy(desc(stocks.marketCap));

  const filtered = market === 'all'
    ? allStocks
    : allStocks.filter(s => s.market === market.toUpperCase());

  return NextResponse.json({
    stocks: filtered.map(s => ({
      symbol: s.symbol,
      name: s.name,
      exchange: s.exchange,
      market: s.market,
      price: s.lastPrice,
      previousClose: s.previousClose,
      dayChangePercent: s.dayChangePercent,
      volume: s.volume,
      marketCap: s.marketCap,
    })),
    count: filtered.length,
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
