#!/usr/bin/env node
/**
 * Fetch stock prices using Yahoo Finance v8 quote API directly (bypassing yahoo-finance2 library).
 * Uses batch requests of 10 symbols at a time.
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { neon } = require('../apps/web/node_modules/@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// First get a crumb + cookie from Yahoo Finance
async function getCrumbAndCookies() {
  // Step 1: Get initial cookies
  const consentRes = await fetch('https://fc.yahoo.com', { redirect: 'manual' });
  const setCookies = consentRes.headers.getSetCookie?.() || [];
  const cookieStr = setCookies.map(c => c.split(';')[0]).join('; ');

  // Step 2: Get crumb
  const crumbRes = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
    headers: {
      'Cookie': cookieStr,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });
  const crumb = await crumbRes.text();
  return { crumb, cookie: cookieStr };
}

async function fetchBatchQuotes(symbols, crumb, cookie) {
  const symbolStr = symbols.join(',');
  const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbolStr)}&crumb=${encodeURIComponent(crumb)}`;

  const res = await fetch(url, {
    headers: {
      'Cookie': cookie,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.quoteResponse?.result || [];
}

async function main() {
  console.log('Fetching stocks from database...');
  const stocks = await sql`SELECT symbol FROM stocks ORDER BY symbol`;
  console.log(`Found ${stocks.length} stocks to fetch`);

  // Get auth credentials
  console.log('Getting Yahoo Finance credentials...');
  let auth;
  try {
    auth = await getCrumbAndCookies();
    console.log('Got crumb:', auth.crumb.slice(0, 10) + '...');
  } catch (err) {
    console.error('Failed to get Yahoo Finance credentials:', err.message);
    console.log('Trying alternative approach...');
    // Try without crumb
    auth = { crumb: '', cookie: '' };
  }

  // Batch fetch in groups of 10
  const batchSize = 10;
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < stocks.length; i += batchSize) {
    const batch = stocks.slice(i, i + batchSize).map(s => s.symbol);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(stocks.length / batchSize);

    try {
      const quotes = await fetchBatchQuotes(batch, auth.crumb, auth.cookie);

      for (const q of quotes) {
        if (q.regularMarketPrice) {
          await sql`UPDATE stocks SET
            last_price = ${q.regularMarketPrice},
            previous_close = ${q.regularMarketPreviousClose || q.regularMarketPrice},
            day_change_percent = ${q.regularMarketChangePercent || 0},
            volume = ${q.regularMarketVolume || 0},
            market_cap = ${q.marketCap || null},
            updated_at = NOW()
          WHERE symbol = ${q.symbol}`;
          updated++;
          console.log(`  ${q.symbol}: ${q.regularMarketPrice} (${(q.regularMarketChangePercent || 0).toFixed(2)}%)`);
        }
      }
      console.log(`[Batch ${batchNum}/${totalBatches}] Fetched ${quotes.length}/${batch.length} quotes`);
    } catch (err) {
      console.error(`[Batch ${batchNum}/${totalBatches}] ERROR: ${err.message}`);
      failed += batch.length;

      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        console.log('Unauthorized - trying to refresh credentials...');
        try {
          auth = await getCrumbAndCookies();
          console.log('Refreshed credentials, retrying...');
          i -= batchSize; // Retry this batch
          await sleep(5000);
          continue;
        } catch {
          console.log('Could not refresh credentials');
        }
      }

      if (err.message.includes('429') || err.message.includes('Too Many')) {
        console.log('Rate limited, waiting 30 seconds...');
        await sleep(30000);
        i -= batchSize; // Retry
        continue;
      }
    }

    // Wait between batches
    await sleep(3000);
  }

  console.log(`\nDone: ${updated} updated, ${failed} failed out of ${stocks.length} total`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
