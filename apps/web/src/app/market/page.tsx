'use client';

import { BarChart3 } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';

interface Stock {
  symbol: string;
  name: string;
  price: string;
  change: number;
  volume: string;
}

const indiaStocks: Stock[] = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', price: '₹2,450.30', change: 1.24, volume: '12.5M' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', price: '₹3,890.15', change: -0.82, volume: '4.2M' },
  { symbol: 'INFY.NS', name: 'Infosys', price: '₹1,620.45', change: 2.15, volume: '8.7M' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', price: '₹1,545.80', change: -0.35, volume: '6.3M' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', price: '₹1,089.20', change: 0.98, volume: '9.1M' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', price: '₹2,310.60', change: -1.42, volume: '2.8M' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', price: '₹1,178.90', change: 3.21, volume: '5.4M' },
  { symbol: 'ITC.NS', name: 'ITC Limited', price: '₹465.35', change: 0.56, volume: '15.2M' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', price: '₹628.70', change: -0.18, volume: '18.9M' },
  { symbol: 'LT.NS', name: 'Larsen & Toubro', price: '₹3,245.50', change: 1.87, volume: '3.1M' },
];

const usaStocks: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: '$195.30', change: 0.85, volume: '52.3M' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: '$420.15', change: 1.32, volume: '28.7M' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$178.40', change: -0.67, volume: '22.1M' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: '$185.60', change: 2.04, volume: '45.8M' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: '$890.20', change: 3.45, volume: '38.9M' },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: '$505.30', change: -1.23, volume: '18.4M' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: '$245.80', change: -2.15, volume: '62.1M' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', price: '$408.90', change: 0.34, volume: '3.2M' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: '$198.45', change: 1.12, volume: '9.8M' },
  { symbol: 'V', name: 'Visa Inc.', price: '$278.60', change: 0.78, volume: '6.5M' },
];

function StockTable({ stocks }: { stocks: Stock[] }) {
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
                {stock.price}
              </td>
              <td
                className={`px-6 py-4 text-right font-mono text-sm ${
                  stock.change >= 0 ? 'text-success' : 'text-destructive'
                }`}
              >
                {stock.change >= 0 ? '▲' : '▼'}{' '}
                {stock.change >= 0 ? '+' : ''}
                {stock.change.toFixed(2)}%
              </td>
              <td className="px-6 py-4 text-right font-mono text-sm text-muted-foreground">
                {stock.volume}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MarketPage() {
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
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-muted-foreground">India NSE:</span>
          <span className="font-medium text-success">Open</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-zinc-900/50 px-4 py-2 text-sm">
          <span className="h-2 w-2 rounded-full bg-destructive" />
          <span className="text-muted-foreground">USA NYSE:</span>
          <span className="font-medium text-destructive">Closed</span>
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
            <StockTable stocks={indiaStocks} />
          </div>
        </Tabs.Content>

        <Tabs.Content value="usa">
          <div className="overflow-hidden rounded-xl border border-border bg-zinc-900/50">
            <StockTable stocks={usaStocks} />
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
