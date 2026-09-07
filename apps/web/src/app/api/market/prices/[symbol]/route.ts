import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { stocks, marketSnapshots } from '@blooper-arena/database/schema';
import { eq, desc, and, gt } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
) {
  const { symbol } = await params;
  const db = getDb();

  const [stock] = await db
    .select()
    .from(stocks)
    .where(eq(stocks.symbol, symbol))
    .limit(1);

  if (!stock) {
    return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
  }

  // Get 24h price history
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const history = await db
    .select()
    .from(marketSnapshots)
    .where(
      and(
        eq(marketSnapshots.symbol, symbol),
        gt(marketSnapshots.snapshotAt, oneDayAgo),
      ),
    )
    .orderBy(desc(marketSnapshots.snapshotAt))
    .limit(96); // ~24h at 15min intervals

  return NextResponse.json({
    symbol: stock.symbol,
    name: stock.name,
    exchange: stock.exchange,
    market: stock.market,
    price: stock.lastPrice,
    previousClose: stock.previousClose,
    dayChangePercent: stock.dayChangePercent,
    volume: stock.volume,
    marketCap: stock.marketCap,
    history: history.map(h => ({
      price: h.price,
      volume: h.volume,
      time: h.snapshotAt.toISOString(),
    })),
  });
}
