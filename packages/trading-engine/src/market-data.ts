import type { QuoteData } from './types.js';

// Cache crumb + cookies for Yahoo Finance API
let cachedAuth: { crumb: string; cookie: string; expiresAt: number } | null = null;

async function getYahooAuth(): Promise<{ crumb: string; cookie: string }> {
  if (cachedAuth && Date.now() < cachedAuth.expiresAt) {
    return cachedAuth;
  }

  // Get cookies from Yahoo Finance
  const consentRes = await fetch('https://fc.yahoo.com', { redirect: 'manual' });
  const setCookies: string[] = (consentRes.headers as any).getSetCookie?.() ?? [];
  const cookie = setCookies.map((c: string) => c.split(';')[0]).join('; ');

  // Get crumb
  const crumbRes = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
    headers: {
      'Cookie': cookie,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });
  const crumb = await crumbRes.text();

  cachedAuth = { crumb, cookie, expiresAt: Date.now() + 3600_000 }; // 1 hour
  return cachedAuth;
}

export async function fetchQuote(symbol: string): Promise<QuoteData | null> {
  try {
    const { crumb, cookie } = await getYahooAuth();
    const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}&crumb=${encodeURIComponent(crumb)}`;
    const res = await fetch(url, {
      headers: {
        'Cookie': cookie,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (!res.ok) return null;

    const data: any = await res.json();
    const result = data.quoteResponse?.result?.[0];
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

  const { crumb, cookie } = await getYahooAuth();

  // Batch fetch in groups of 10 with delays
  const chunkSize = 10;
  const chunks: string[][] = [];
  for (let i = 0; i < symbols.length; i += chunkSize) {
    chunks.push(symbols.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    try {
      const symbolStr = chunk.join(',');
      const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolStr)}&crumb=${encodeURIComponent(crumb)}`;
      const res = await fetch(url, {
        headers: {
          'Cookie': cookie,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      if (!res.ok) {
        console.error(`[market-data] Batch fetch failed: HTTP ${res.status}`);
        continue;
      }

      const data: any = await res.json();
      const quotes = data.quoteResponse?.result ?? [];

      for (const q of quotes) {
        if (q.regularMarketPrice) {
          results.set(q.symbol, {
            symbol: q.symbol,
            price: q.regularMarketPrice,
            previousClose: q.regularMarketPreviousClose ?? q.regularMarketPrice,
            dayChangePercent: q.regularMarketChangePercent ?? 0,
            volume: q.regularMarketVolume ?? 0,
            marketCap: q.marketCap ?? null,
          });
        }
      }

      // Delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.error(`[market-data] Batch fetch error:`, err);
    }
  }

  return results;
}
