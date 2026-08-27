'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  previousRank: number | null;
  characterId: string;
  displayName: string;
  netWorth: number;
  level: number;
  score: number;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentCharacterId?: string;
}

export function LeaderboardTable({ entries, currentCharacterId }: LeaderboardTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="pb-3 pr-4 font-medium w-16">Rank</th>
            <th className="pb-3 pr-4 font-medium w-12"></th>
            <th className="pb-3 pr-4 font-medium">Player</th>
            <th className="pb-3 pr-4 font-medium text-right">Net Worth</th>
            <th className="pb-3 font-medium text-right w-16">Level</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isCurrentUser = entry.characterId === currentCharacterId;
            const rankChange =
              entry.previousRank != null ? entry.previousRank - entry.rank : null;

            return (
              <tr
                key={entry.characterId}
                className={cn(
                  'border-b border-border/50 transition-colors',
                  isCurrentUser && 'bg-primary/5',
                )}
              >
                <td className="py-3 pr-4">
                  <span
                    className={cn(
                      'font-bold',
                      entry.rank <= 3 && 'text-primary',
                    )}
                  >
                    {entry.rank === 1 && '  '}
                    {entry.rank === 2 && '  '}
                    {entry.rank === 3 && '  '}
                    #{entry.rank}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  {rankChange !== null && (
                    <div
                      className={cn(
                        'flex items-center gap-0.5 text-xs',
                        rankChange > 0
                          ? 'text-success'
                          : rankChange < 0
                            ? 'text-destructive'
                            : 'text-muted-foreground',
                      )}
                    >
                      {rankChange > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : rankChange < 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      {rankChange !== 0 && Math.abs(rankChange)}
                    </div>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <span className={cn('font-medium', isCurrentUser && 'text-primary')}>
                    {entry.displayName}
                    {isCurrentUser && ' (You)'}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right font-mono">
                  {formatCompact(entry.netWorth)}
                </td>
                <td className="py-3 text-right text-muted-foreground">{entry.level}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatCompact(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(2)}Cr`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
