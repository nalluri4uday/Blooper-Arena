import { portfolios, holdings, stocks } from '@blooper-arena/database/schema';
import { eq } from 'drizzle-orm';

export async function runPortfolioCalculator(db: any) {
  console.log('[portfolio-calculator] Starting portfolio recalculation...');

  try {
    // Get all holdings with current stock prices
    const allHoldings = await db
      .select({
        holdingId: holdings.id,
        agentId: holdings.agentId,
        portfolioId: holdings.portfolioId,
        symbol: holdings.symbol,
        quantity: holdings.quantity,
        avgBuyPrice: holdings.avgBuyPrice,
        stockPrice: stocks.lastPrice,
      })
      .from(holdings)
      .innerJoin(stocks, eq(holdings.stockId, stocks.id));

    // Group by portfolio
    const portfolioMap = new Map<string, {
      agentId: string;
      totalHoldingsValue: number;
      holdings: typeof allHoldings;
    }>();

    for (const h of allHoldings) {
      if (!portfolioMap.has(h.portfolioId)) {
        portfolioMap.set(h.portfolioId, {
          agentId: h.agentId,
          totalHoldingsValue: 0,
          holdings: [],
        });
      }
      const entry = portfolioMap.get(h.portfolioId)!;
      const currentValue = h.quantity * h.stockPrice;
      entry.totalHoldingsValue += currentValue;
      entry.holdings.push(h);
    }

    // Update each holding
    let holdingsUpdated = 0;
    for (const h of allHoldings) {
      const currentValue = h.quantity * h.stockPrice;
      const pnl = (h.stockPrice - h.avgBuyPrice) * h.quantity;
      const pnlPercent = h.avgBuyPrice > 0
        ? ((h.stockPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100
        : 0;

      await db.update(holdings).set({
        currentPrice: h.stockPrice,
        currentValue,
        pnl,
        pnlPercent,
        updatedAt: new Date(),
      }).where(eq(holdings.id, h.holdingId));

      holdingsUpdated++;
    }

    // Update each portfolio
    let portfoliosUpdated = 0;
    const STARTING_CAPITAL = 1000000;

    // Get all portfolios (including those with no holdings)
    const allPortfolios = await db.select().from(portfolios);

    for (const p of allPortfolios) {
      const holdingsData = portfolioMap.get(p.id);
      const holdingsValue = holdingsData?.totalHoldingsValue ?? 0;
      const totalValue = p.cash + holdingsValue;
      const totalPnl = totalValue - STARTING_CAPITAL;
      const totalPnlPercent = (totalPnl / STARTING_CAPITAL) * 100;

      await db.update(portfolios).set({
        totalValue,
        totalPnl,
        totalPnlPercent,
        dayPnl: holdingsValue > 0 ? totalPnl : 0, // Simplified
        updatedAt: new Date(),
      }).where(eq(portfolios.id, p.id));

      portfoliosUpdated++;
    }

    console.log(`[portfolio-calculator] Updated ${holdingsUpdated} holdings, ${portfoliosUpdated} portfolios`);
  } catch (error) {
    console.error('[portfolio-calculator] Error:', error);
  }
}
