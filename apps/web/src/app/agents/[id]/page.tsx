import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Bot,
  Wallet,
  TrendingUp,
  Target,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';

const agentData = {
  id: 'a1',
  name: 'AlphaBot',
  description:
    'A momentum-based trading agent that uses technical analysis and sentiment data to make trading decisions across Indian and US markets.',
  strategy: 'Momentum',
  createdAt: '2024-01-15',
  stats: {
    totalValue: '₹12,45,320',
    totalPnl: '₹2,45,320',
    totalPnlPercent: 24.53,
    winRate: 68.2,
    totalTrades: 1247,
  },
};

const holdings = [
  { symbol: 'RELIANCE.NS', qty: 50, avgPrice: '₹2,380.00', currentPrice: '₹2,450.30', pnl: '₹3,515', pnlPercent: 2.95 },
  { symbol: 'TCS.NS', qty: 30, avgPrice: '₹3,750.00', currentPrice: '₹3,890.15', pnl: '₹4,204', pnlPercent: 3.74 },
  { symbol: 'AAPL', qty: 25, avgPrice: '$188.50', currentPrice: '$195.30', pnl: '$170', pnlPercent: 3.61 },
  { symbol: 'INFY.NS', qty: 100, avgPrice: '₹1,580.00', currentPrice: '₹1,620.45', pnl: '₹4,045', pnlPercent: 2.56 },
  { symbol: 'MSFT', qty: 15, avgPrice: '$405.20', currentPrice: '$420.15', pnl: '$224', pnlPercent: 3.69 },
  { symbol: 'HDFCBANK.NS', qty: 80, avgPrice: '₹1,560.00', currentPrice: '₹1,545.80', pnl: '-₹1,136', pnlPercent: -0.91 },
  { symbol: 'NVDA', qty: 10, avgPrice: '$850.00', currentPrice: '$890.20', pnl: '$402', pnlPercent: 4.73 },
];

const recentTrades = [
  { date: '2024-03-15 14:32', symbol: 'RELIANCE.NS', side: 'buy' as const, qty: 20, price: '₹2,445.50', amount: '₹48,910' },
  { date: '2024-03-15 10:15', symbol: 'AAPL', side: 'sell' as const, qty: 10, price: '$194.80', amount: '$1,948' },
  { date: '2024-03-14 15:45', symbol: 'INFY.NS', side: 'buy' as const, qty: 50, price: '₹1,615.20', amount: '₹80,760' },
  { date: '2024-03-14 11:20', symbol: 'NVDA', side: 'buy' as const, qty: 5, price: '$885.40', amount: '$4,427' },
  { date: '2024-03-13 14:50', symbol: 'HDFCBANK.NS', side: 'sell' as const, qty: 30, price: '₹1,552.00', amount: '₹46,560' },
  { date: '2024-03-13 09:30', symbol: 'TCS.NS', side: 'buy' as const, qty: 15, price: '₹3,875.60', amount: '₹58,134' },
  { date: '2024-03-12 13:15', symbol: 'MSFT', side: 'buy' as const, qty: 10, price: '$412.30', amount: '$4,123' },
  { date: '2024-03-12 10:05', symbol: 'ICICIBANK.NS', side: 'sell' as const, qty: 40, price: '₹1,092.50', amount: '₹43,700' },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  // In production, fetch agent name from DB. For now, use mock data.
  const name = id === 'a1' ? 'AlphaBot' : `Agent ${id}`;
  return {
    title: `${name} | Blooper Arena`,
    description: `View the trading profile, portfolio and performance of ${name}.`,
  };
}

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params; // consume the params promise
  const agent = agentData;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Back link */}
      <Link
        href="/leaderboard"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Leaderboard
      </Link>

      {/* Agent Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Bot className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{agent.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{agent.description}</p>
          </div>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          <Target className="h-3.5 w-3.5" />
          {agent.strategy}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Total Value',
            value: agent.stats.totalValue,
            icon: Wallet,
            color: 'text-foreground',
          },
          {
            label: 'Total PnL',
            value: `${agent.stats.totalPnl} (${agent.stats.totalPnlPercent >= 0 ? '+' : ''}${agent.stats.totalPnlPercent}%)`,
            icon: TrendingUp,
            color: agent.stats.totalPnlPercent >= 0 ? 'text-success' : 'text-destructive',
          },
          {
            label: 'Win Rate',
            value: `${agent.stats.winRate}%`,
            icon: Target,
            color: 'text-foreground',
          },
          {
            label: 'Total Trades',
            value: agent.stats.totalTrades.toLocaleString(),
            icon: BarChart3,
            color: 'text-foreground',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-zinc-900/50 p-6"
          >
            <div className="mb-3 flex items-center gap-2 text-muted-foreground">
              <stat.icon className="h-4 w-4" />
              <span className="text-sm">{stat.label}</span>
            </div>
            <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Holdings */}
      <div className="mb-10">
        <h2 className="mb-4 text-xl font-bold text-foreground">Holdings</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-zinc-900/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="px-6 py-4 font-medium">Symbol</th>
                  <th className="px-6 py-4 font-medium text-right">Quantity</th>
                  <th className="px-6 py-4 font-medium text-right">Avg Buy Price</th>
                  <th className="px-6 py-4 font-medium text-right">Current Price</th>
                  <th className="px-6 py-4 font-medium text-right">P&L</th>
                  <th className="px-6 py-4 font-medium text-right">P&L%</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr
                    key={h.symbol}
                    className="border-b border-border/50 last:border-0 transition-colors hover:bg-zinc-800/50"
                  >
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-foreground">
                      {h.symbol}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-foreground">
                      {h.qty}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-muted-foreground">
                      {h.avgPrice}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-foreground">
                      {h.currentPrice}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-mono text-sm ${
                        h.pnlPercent >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {h.pnl}
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-mono text-sm ${
                        h.pnlPercent >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {h.pnlPercent >= 0 ? '+' : ''}
                      {h.pnlPercent.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-foreground">Recent Trades</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-zinc-900/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Symbol</th>
                  <th className="px-6 py-4 font-medium">Side</th>
                  <th className="px-6 py-4 font-medium text-right">Quantity</th>
                  <th className="px-6 py-4 font-medium text-right">Price</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((t, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 last:border-0 transition-colors hover:bg-zinc-800/50"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-muted-foreground">
                      {t.date}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-foreground">
                      {t.symbol}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                          t.side === 'buy'
                            ? 'bg-success/10 text-success'
                            : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {t.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-foreground">
                      {t.qty}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-foreground">
                      {t.price}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm text-foreground">
                      {t.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
