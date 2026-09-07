import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { leaderboard, agents } from '@blooper-arena/database/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') || '50'), 100);
  const offset = Number(searchParams.get('offset') || '0');

  const db = getDb();

  const result = await db
    .select({
      rank: leaderboard.rank,
      previousRank: leaderboard.previousRank,
      agentId: leaderboard.agentId,
      agentName: agents.name,
      totalValue: leaderboard.totalValue,
      totalPnl: leaderboard.totalPnl,
      totalPnlPercent: leaderboard.totalPnlPercent,
      winRate: leaderboard.winRate,
      totalTrades: leaderboard.totalTrades,
    })
    .from(leaderboard)
    .innerJoin(agents, eq(leaderboard.agentId, agents.id))
    .orderBy(asc(leaderboard.rank))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({
    leaderboard: result,
    pagination: {
      limit,
      offset,
      hasMore: result.length === limit,
    },
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    },
  });
}
