'use client';

import { BarChart3, Loader2 } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { useQuery } from '@tanstack/react-query';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  dayChangePercent: number;
  volume: number;
  exchange: string;
  market: string;
}

interface MarketPricesResponse {
  stocks: Stock[];
  count: number;
}

interface MarketStatus {
  india: 'open' | 'closed';
  us: 'open' | 'closed';
}

function formatPrice(price: number, market: string): string {
  if (market === 'IN') {
    return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`;
  }
  return volume.toString();
}

async function fetchMarketPrices(market: string): Promise<MarketPricesResponse> {
  const res = await fetch(`/api/market/prices?market=${market}`);
  if (!res.ok) throw new Error('Failed to fetch market prices');
  return res.json();
}

async function fetchMarketStatus(): Promise<MarketStatus> {
  const res = await fetch('/api/market/status');
  if (!res.ok) throw new Error('Failed to fetch market status');
  return res.json();
}

function StockTable({ stocks, market }: { stocks: Stock[]; market: string }) {
  if (stocks.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-muted-foreground">
        No stock data available yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left text-sm text-muted-foreground">
            <th className="px-6 py-4 font-medium">Symbol</th>
            <th className="px-6 py-4 font-medium">Name</th>
            <th className="px-6 py-4 font-medium text-right">Price</th>
            <th className="px-6 py-4 font-medium text-right">Day Change %</th>
            <th className="px-6 py-4 font-medium text-right">Volume</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr
              key={stock.symbol}
              className="border-b border-border/50 last:border-0 transition-colors hover:bg-zinc-800/50"
            >
              <td className="px-6 py-4 font-mono text-sm font-semibold text-foreground">
                {stock.symbol}
              </td>
              <td className="px-6 py-4 text-sm text-muted-foreground">{stock.name}</td>
              <td className="px-6 py-4 text-right font-mono text-sm text-foreground">
                {formatPrice(stock.price, market)}
              </td>
              <td
                className={`px-6 py-4 text-right font-mono text-sm ${
                  stock.dayChangePercent >= 0 ? 'text-success' : 'text-destructive'
                }`}
              >
                {stock.dayChangePercent >= 0 ? '▲' : '▼'}{' '}
                {stock.dayChangePercent >= 0 ? '+' : ''}
                {stock.dayChangePercent.toFixed(2)}%
              </td>
              <td className="px-6 py-4 text-right font-mono text-sm text-muted-foreground">
                {formatVolume(stock.volume)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center px-6 py-16">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="ml-3 text-sm text-muted-foreground">Loading market data...</span>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="px-6 py-12 text-center text-destructive">
      {message}
    </div>
  );
}

export default function MarketPage() {
  const { data: statusData } = useQuery({
    queryKey: ['market-status'],
    queryFn: fetchMarketStatus,
    refetchInterval: 60_000,
  });

  const { data: indiaData, isLoading: indiaLoading, error: indiaError } = useQuery({
    queryKey: ['market-prices', 'IN'],
    queryFn: () => fetchMarketPrices('IN'),
    refetchInterval: 60_000,
  });

  const { data: usaData, isLoading: usaLoading, error: usaError } = useQuery({
    queryKey: ['market-prices', 'US'],
    queryFn: () => fetchMarketPrices('US'),
    refetchInterval: 60_000,
  });

  const indiaStatus = statusData?.india ?? 'closed';
  const usStatus = statusData?.us ?? 'closed';

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Market Overview</h1>
          <p className="text-muted-foreground">Real-time stock prices across supported markets</p>
        </div>
      </div>

      {/* Market Status */}
      <div className="mb-8 flex flex-wrap gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-zinc-900/50 px-4 py-2 text-sm">
          <span className={`h-2 w-2 rounded-full ${indiaStatus === 'open' ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
          <span className="text-muted-foreground">India NSE:</span>
          <span className={`font-medium ${indiaStatus === 'open' ? 'text-success' : 'text-destructive'}`}>
            {indiaStatus === 'open' ? 'Open' : 'Closed'}
          </span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-zinc-900/50 px-4 py-2 text-sm">
          <span className={`h-2 w-2 rounded-full ${usStatus === 'open' ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
          <span className="text-muted-foreground">USA NYSE:</span>
          <span className={`font-medium ${usStatus === 'open' ? 'text-success' : 'text-destructive'}`}>
            {usStatus === 'open' ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="india">
        <Tabs.List className="mb-6 flex gap-1 rounded-lg border border-border bg-zinc-900/50 p-1 w-fit">
          <Tabs.Trigger
            value="india"
            className="rounded-md px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            India (NSE)
          </Tabs.Trigger>
          <Tabs.Trigger
            value="usa"
            className="rounded-md px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            USA (NYSE/NASDAQ)
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="india">
          <div className="overflow-hidden rounded-xl border border-border bg-zinc-900/50">
            {indiaLoading ? (
              <LoadingState />
            ) : indiaError ? (
              <ErrorState message="Failed to load Indian market data. Please try again later." />
            ) : (
              <StockTable stocks={indiaData?.stocks ?? []} market="IN" />
            )}
          </div>
        </Tabs.Content>

        <Tabs.Content value="usa">
          <div className="overflow-hidden rounded-xl border border-border bg-zinc-900/50">
            {usaLoading ? (
              <LoadingState />
            ) : usaError ? (
              <ErrorState message="Failed to load US market data. Please try again later." />
            ) : (
              <StockTable stocks={usaData?.stocks ?? []} market="US" />
            )}
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
