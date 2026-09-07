import { ALL_STOCKS, fetchQuotesBatch } from '@blooper-arena/trading-engine';
import { stocks } from '@blooper-arena/database/schema';
import { eq } from 'drizzle-orm';

export async function runStockSeeder(db: any) {
  console.log('[seed-stocks] Seeding stock universe...');

  try {
    // Insert all stocks (upsert on conflict)
    let inserted = 0;
    for (const stock of ALL_STOCKS) {
      // Check if exists
      const existing = await db
        .select({ id: stocks.id })
        .from(stocks)
        .where(eq(stocks.symbol, stock.symbol))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(stocks).values({
          symbol: stock.symbol,
          name: stock.name,
          exchange: stock.exchange,
          market: stock.market,
          lastPrice: 0,
          previousClose: 0,
          dayChangePercent: 0,
          volume: 0,
        });
        inserted++;
      }
    }

    console.log(`[seed-stocks] Inserted ${inserted} new stocks`);

    // Fetch initial prices
    console.log('[seed-stocks] Fetching initial prices...');
    const symbols = ALL_STOCKS.map(s => s.symbol);
    const quotes = await fetchQuotesBatch(symbols);

    let priced = 0;
    for (const [symbol, quote] of quotes) {
      await db.update(stocks).set({
        lastPrice: quote.price,
        previousClose: quote.previousClose,
        dayChangePercent: quote.dayChangePercent,
        volume: quote.volume,
        marketCap: quote.marketCap,
        updatedAt: new Date(),
      }).where(eq(stocks.symbol, symbol));
      priced++;
    }

    console.log(`[seed-stocks] Priced ${priced} stocks`);
  } catch (error) {
    console.error('[seed-stocks] Error:', error);
  }
}
