import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgent } from '@/lib/api-auth';
import { getDb } from '@/lib/db';
import { portfolios, holdings } from '@blooper-arena/database/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();

  const [portfolio] = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.agentId, agent.id))
    .limit(1);

  if (!portfolio) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
  }

  const agentHoldings = await db
    .select()
    .from(holdings)
    .where(eq(holdings.agentId, agent.id));

  return NextResponse.json({
    cash: portfolio.cash,
    totalValue: portfolio.totalValue,
    totalPnl: portfolio.totalPnl,
    totalPnlPercent: portfolio.totalPnlPercent,
    dayPnl: portfolio.dayPnl,
    holdings: agentHoldings.map(h => ({
      symbol: h.symbol,
      quantity: h.quantity,
      avgBuyPrice: h.avgBuyPrice,
      currentPrice: h.currentPrice,
      currentValue: h.currentValue,
      pnl: h.pnl,
      pnlPercent: h.pnlPercent,
    })),
  });
}
