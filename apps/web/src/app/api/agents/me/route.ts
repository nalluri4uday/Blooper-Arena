import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgent } from '@/lib/api-auth';
import { getDb } from '@/lib/db';
import { portfolios, holdings, trades } from '@blooper-arena/database/schema';
import { eq, desc } from 'drizzle-orm';

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

  const agentHoldings = await db
    .select()
    .from(holdings)
    .where(eq(holdings.agentId, agent.id));

  const recentTrades = await db
    .select()
    .from(trades)
    .where(eq(trades.agentId, agent.id))
    .orderBy(desc(trades.createdAt))
    .limit(10);

  return NextResponse.json({
    agent: {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      strategy: agent.strategy,
      totalTrades: agent.totalTrades,
      winRate: agent.winRate,
      createdAt: agent.createdAt.toISOString(),
    },
    portfolio: portfolio ? {
      cash: portfolio.cash,
      totalValue: portfolio.totalValue,
      totalPnl: portfolio.totalPnl,
      totalPnlPercent: portfolio.totalPnlPercent,
      dayPnl: portfolio.dayPnl,
    } : null,
    holdings: agentHoldings.map(h => ({
      symbol: h.symbol,
      quantity: h.quantity,
      avgBuyPrice: h.avgBuyPrice,
      currentPrice: h.currentPrice,
      currentValue: h.currentValue,
      pnl: h.pnl,
      pnlPercent: h.pnlPercent,
    })),
    recentTrades: recentTrades.map(t => ({
      id: t.id,
      symbol: t.symbol,
      side: t.side,
      quantity: t.quantity,
      price: t.price,
      totalAmount: t.totalAmount,
      status: t.status,
      executedAt: t.executedAt.toISOString(),
    })),
  });
}
