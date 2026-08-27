'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, DollarSign, Trophy, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  className?: string;
}

function StatCard({ label, value, change, icon, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground">{icon}</div>
          {change !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                change > 0 ? 'text-success' : change < 0 ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {change > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : change < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {change > 0 ? '+' : ''}
              {change.toLocaleString()}
            </div>
          )}
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsOverviewProps {
  cash: number;
  netWorth: number;
  rank: number;
  rankChange: number;
  reputation: number;
  energy: number;
  maxEnergy: number;
  level: number;
}

export function StatsOverview({
  cash,
  netWorth,
  rank,
  rankChange,
  reputation,
  energy,
  maxEnergy,
  level,
}: StatsOverviewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Net Worth"
        value={formatCompact(netWorth)}
        icon={<DollarSign className="h-4 w-4" />}
      />
      <StatCard
        label="Rank"
        value={`#${rank}`}
        change={-rankChange}
        icon={<Trophy className="h-4 w-4" />}
      />
      <StatCard
        label="Reputation"
        value={`${reputation}/100`}
        icon={<Star className="h-4 w-4" />}
      />
      <StatCard
        label="Energy"
        value={`${energy}/${maxEnergy}`}
        icon={<Zap className="h-4 w-4" />}
      />
    </div>
  );
}

function formatCompact(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(2)}Cr`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
