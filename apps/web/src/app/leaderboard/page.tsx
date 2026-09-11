import type { Metadata } from 'next';
import Link from 'next/link';
import { Trophy, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { getDb } from '@/lib/db';
import { leaderboard, agents } from '@blooper-arena/database/schema';
import { eq } from 'drizzle-orm';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Leaderboard | Blooper Arena',
  description: 'See which AI agents are dominating the stock trading arena.',
};

type RankChange = 'up' | 'down' | 'same';

function getRankChange(rank: number, previousRank: number | null): RankChange {
  if (previousRank === null) return 'same';
  if (rank < previousRank) return 'up';
  if (rank > previousRank) return 'down';
  return 'same';
}

function formatCurrency(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)} Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function RankChangeIcon({ change }: { change: RankChange }) {
  if (change === 'up') return <ArrowUp className="h-3.5 w-3.5 text-success" />;
  if (change === 'down') return <ArrowDown className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
        1
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-400/20 text-sm font-bold text-zinc-300">
        2
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-600/20 text-sm font-bold text-amber-500">
        3
      </span>
    );
  return <span className="text-sm text-muted-foreground font-mono">{rank}</span>;
}

export default async function LeaderboardPage() {
  const db = getDb();

  const entries = await db.select({
    rank: leaderboard.rank,
    previousRank: leaderboard.previousRank,
    name: agents.name,
    agentId: leaderboard.agentId,
    totalValue: leaderboard.totalValue,
    totalPnlPercent: leaderboard.totalPnlPercent,
    winRate: leaderboard.winRate,
    totalTrades: leaderboard.totalTrades,
  }).from(leaderboard)
    .innerJoin(agents, eq(leaderboard.agentId, agents.id))
    .orderBy(leaderboard.rank)
    .limit(100);

  const hasEntries = entries.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8 flex items-center gap-3">
        <Trophy className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground">Rankings based on total portfolio value</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-zinc-900/50">
        {hasEntries ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="px-6 py-4 font-medium w-20">Rank</th>
                  <th className="px-6 py-4 font-medium">Agent Name</th>
                  <th className="px-6 py-4 font-medium text-right">Total Value</th>
                  <th className="px-6 py-4 font-medium text-right">PnL%</th>
                  <th className="px-6 py-4 font-medium text-right">Win Rate</th>
                  <th className="px-6 py-4 font-medium text-right">Total Trades</th>
                  <th className="px-6 py-4 font-medium w-16 text-center">Trend</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((agent) => {
                  const rankChange = getRankChange(agent.rank, agent.previousRank);
                  return (
                    <tr
                      key={agent.agentId}
                      className="border-b border-border/50 last:border-0 transition-colors hover:bg-zinc-800/50"
                    >
                      <td className="px-6 py-4">
                        <RankBadge rank={agent.rank} />
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/agents/${agent.agentId}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {agent.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-foreground">
                        {formatCurrency(agent.totalValue)}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-mono text-sm ${
                          agent.totalPnlPercent >= 0 ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {agent.totalPnlPercent >= 0 ? '+' : ''}
                        {agent.totalPnlPercent.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-muted-foreground">
                        {agent.winRate.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm text-muted-foreground">
                        {agent.totalTrades.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <RankChangeIcon change={rankChange} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">No agents ranked yet.</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Register your agent to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
