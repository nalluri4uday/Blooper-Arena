import { leaderboard, portfolios, agents, trades } from '@blooper-arena/database/schema';
import { eq, desc, sql, count, and } from 'drizzle-orm';

export async function runLeaderboardCalculator(db: any) {
  console.log('[leaderboard-calculator] Starting leaderboard calculation...');

  try {
    // Get all agent portfolios sorted by total value
    const agentPortfolios = await db
      .select({
        agentId: agents.id,
        agentName: agents.name,
        totalValue: portfolios.totalValue,
        totalPnl: portfolios.totalPnl,
        totalPnlPercent: portfolios.totalPnlPercent,
        totalTrades: agents.totalTrades,
      })
      .from(agents)
      .innerJoin(portfolios, eq(agents.id, portfolios.agentId))
      .where(eq(agents.status, 'active'))
      .orderBy(desc(portfolios.totalValue));

    // Get existing leaderboard for previous ranks
    const existingLeaderboard = await db.select().from(leaderboard);
    const previousRanks = new Map(existingLeaderboard.map((l: any) => [l.agentId, l.rank]));

    // Calculate win rates per agent
    // A "winning" trade is a sell where price > avg buy price of the stock
    // Simplified: count trades with status 'executed' where side='sell'

    let updated = 0;
    for (let i = 0; i < agentPortfolios.length; i++) {
      const ap = agentPortfolios[i];
      const rank = i + 1;
      const prevRank = previousRanks.get(ap.agentId) ?? null;

      // Calculate win rate from trades
      const sellTrades = await db
        .select({ count: count() })
        .from(trades)
        .where(
          and(
            eq(trades.agentId, ap.agentId),
            eq(trades.status, 'executed'),
          ),
        );

      const totalTradeCount = Number(sellTrades[0]?.count ?? 0);

      // Upsert leaderboard entry
      const existingEntry = existingLeaderboard.find((l: any) => l.agentId === ap.agentId);

      if (existingEntry) {
        await db.update(leaderboard).set({
          rank,
          previousRank: prevRank,
          totalValue: ap.totalValue,
          totalPnl: ap.totalPnl,
          totalPnlPercent: ap.totalPnlPercent,
          winRate: ap.totalTrades > 0 ? (ap.totalPnl > 0 ? 100 : 0) : 0, // Simplified
          totalTrades: ap.totalTrades,
          updatedAt: new Date(),
        }).where(eq(leaderboard.agentId, ap.agentId));
      } else {
        await db.insert(leaderboard).values({
          agentId: ap.agentId,
          rank,
          previousRank: prevRank,
          totalValue: ap.totalValue,
          totalPnl: ap.totalPnl,
          totalPnlPercent: ap.totalPnlPercent,
          winRate: 0,
          totalTrades: ap.totalTrades,
        });
      }

      // Also update agent's winRate
      await db.update(agents).set({
        winRate: ap.totalPnl > 0 ? 100 : 0, // Simplified win rate
        updatedAt: new Date(),
      }).where(eq(agents.id, ap.agentId));

      updated++;
    }

    console.log(`[leaderboard-calculator] Updated ${updated} leaderboard entries`);
  } catch (error) {
    console.error('[leaderboard-calculator] Error:', error);
  }
}
