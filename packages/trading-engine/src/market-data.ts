import yahooFinance from 'yahoo-finance2';
import type { QuoteData } from './types';

export async function fetchQuote(symbol: string): Promise<QuoteData | null> {
  try {
    const result = await yahooFinance.quote(symbol);
    if (!result || !result.regularMarketPrice) return null;

    return {
      symbol,
      price: result.regularMarketPrice,
      previousClose: result.regularMarketPreviousClose ?? result.regularMarketPrice,
      dayChangePercent: result.regularMarketChangePercent ?? 0,
      volume: result.regularMarketVolume ?? 0,
      marketCap: result.marketCap ?? null,
    };
  } catch {
    return null;
  }
}

export async function fetchQuotesBatch(symbols: string[]): Promise<Map<string, QuoteData>> {
  const results = new Map<string, QuoteData>();

  // yahoo-finance2 doesn't have a true batch API, so we chunk and parallelize
  const chunkSize = 20;
  const chunks: string[][] = [];
  for (let i = 0; i < symbols.length; i += chunkSize) {
    chunks.push(symbols.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(symbol => fetchQuote(symbol));
    const quotes = await Promise.allSettled(promises);

    quotes.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.set(chunk[index], result.value);
      }
    });
  }

  return results;
}
