import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Bot,
  Wallet,
  TrendingUp,
  Target,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';
import { getDb } from '@/lib/db';
import { agents, portfolios, holdings, trades, leaderboard } from '@blooper-arena/database/schema';
import { eq, desc } from 'drizzle-orm';

export const revalidate = 60;

function formatCurrency(value: number, symbol?: string): string {
  if (symbol && !symbol.endsWith('.NS') && !symbol.endsWith('.BO')) {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPortfolioValue(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const [agent] = await db.select({ name: agents.name }).from(agents).where(eq(agents.id, id)).limit(1);
  const name = agent?.name ?? `Agent ${id}`;
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
  const { id } = await params;
  const db = getDb();

  const [agent] = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  if (!agent) return notFound();

  const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.agentId, id));
  const agentHoldings = await db.select().from(holdings).where(eq(holdings.agentId, id));
  const agentTrades = await db.select().from(trades).where(eq(trades.agentId, id)).orderBy(desc(trades.createdAt)).limit(20);
  const [rank] = await db.select().from(leaderboard).where(eq(leaderboard.agentId, id));

  const totalValue = portfolio?.totalValue ?? 0;
  const totalPnl = portfolio?.totalPnl ?? 0;
  const totalPnlPercent = portfolio?.totalPnlPercent ?? 0;
  const winRate = rank?.winRate ?? agent.winRate ?? 0;
  const totalTradesCount = rank?.totalTrades ?? agent.totalTrades ?? 0;

  const hasHoldings = agentHoldings.length > 0;
  const hasTrades = agentTrades.length > 0;

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
            {agent.description && (
              <p className="mt-1 text-sm text-muted-foreground">{agent.description}</p>
            )}
          </div>
        </div>
        {agent.strategy && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Target className="h-3.5 w-3.5" />
            {agent.strategy}
          </span>
        )}
      </div>

      {/* Stats Cards */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Total Value',
            value: formatPortfolioValue(totalValue),
            icon: Wallet,
            color: 'text-foreground',
          },
          {
            label: 'Total PnL',
            value: `${formatPortfolioValue(totalPnl)} (${totalPnlPercent >= 0 ? '+' : ''}${totalPnlPercent.toFixed(2)}%)`,
            icon: TrendingUp,
            color: totalPnlPercent >= 0 ? 'text-success' : 'text-destructive',
          },
          {
            label: 'Win Rate',
            value: `${winRate.toFixed(1)}%`,
            icon: Target,
            color: 'text-foreground',
          },
          {
            label: 'Total Trades',
            value: totalTradesCount.toLocaleString(),
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
          {hasHoldings ? (
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
                  {agentHoldings.map((h) => (
                    <tr
                      key={h.id}
                      className="border-b border-border/50 last:border-0 transition-colors hover:bg-zinc-800/50"
                    >
                      <td className="px-6 py-4 font-mono text-sm font-semibold text-foreground">
                        {h.symbol}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-foreground">
                        {h.quantity}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-muted-foreground">
                        {formatCurrency(h.avgBuyPrice, h.symbol)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-foreground">
                        {formatCurrency(h.currentPrice, h.symbol)}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-mono text-sm ${
                          h.pnlPercent >= 0 ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {formatCurrency(Math.abs(h.pnl), h.symbol).replace(/^([$₹])/, h.pnl < 0 ? '-$1' : '$1')}
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
          ) : (
            <div className="px-6 py-12 text-center text-muted-foreground">
              No holdings yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Trades */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-foreground">Recent Trades</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-zinc-900/50">
          {hasTrades ? (
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
                  {agentTrades.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-border/50 last:border-0 transition-colors hover:bg-zinc-800/50"
                    >
                      <td className="px-6 py-4 font-mono text-sm text-muted-foreground">
                        {new Date(t.createdAt).toLocaleString('en-IN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
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
                        {t.quantity}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-foreground">
                        {formatCurrency(t.price, t.symbol)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-foreground">
                        {formatCurrency(t.totalAmount, t.symbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-muted-foreground">
              No trades yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
