import { fetchQuotesBatch, ALL_STOCKS, isAnyMarketOpen } from '@blooper-arena/trading-engine';
import { stocks, marketSnapshots } from '@blooper-arena/database/schema';
import { eq } from 'drizzle-orm';

export async function runPriceFetcher(db: any) {
  console.log('[price-fetcher] Starting price fetch...');

  const symbols = ALL_STOCKS.map(s => s.symbol);

  try {
    const quotes = await fetchQuotesBatch(symbols);
    console.log(`[price-fetcher] Fetched ${quotes.size} quotes`);

    let updated = 0;
    for (const [symbol, quote] of quotes) {
      // Update stock price
      await db.update(stocks).set({
        lastPrice: quote.price,
        previousClose: quote.previousClose,
        dayChangePercent: quote.dayChangePercent,
        volume: quote.volume,
        marketCap: quote.marketCap,
        updatedAt: new Date(),
      }).where(eq(stocks.symbol, symbol));

      // Insert snapshot for historical data
      await db.insert(marketSnapshots).values({
        symbol,
        price: quote.price,
        volume: quote.volume,
      });

      updated++;
    }

    console.log(`[price-fetcher] Updated ${updated} stocks`);
  } catch (error) {
    console.error('[price-fetcher] Error:', error);
  }
}
