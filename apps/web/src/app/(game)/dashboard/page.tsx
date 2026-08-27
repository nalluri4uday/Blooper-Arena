'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StatsOverview } from '@/components/dashboard/stats-overview';
import { EnergyBar } from '@/components/dashboard/energy-bar';
import { WhileYouWereAway } from '@/components/dashboard/while-you-were-away';
import { PendingDecisions } from '@/components/dashboard/pending-decisions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DashboardData {
  player: {
    cash: number;
    netWorth: number;
    debt: number;
    energy: number;
    maxEnergy: number;
    reputation: number;
    influence: number;
    level: number;
    rank: number;
    rankChange: number;
  };
  events: Array<{
    id: string;
    eventType: string;
    importance: number;
    description: string;
    createdAt: string;
  }>;
  decisions: Array<{
    id: string;
    prompt: string;
    options: Array<{
      key: string;
      label: string;
      description?: string;
      energyCost?: number;
    }>;
    expiresAt: string;
    energyCost: number;
  }>;
  season: {
    name: string;
    endsAt: string;
    daysRemaining: number;
  } | null;
}

export default function DashboardPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/me/dashboard');
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to load dashboard');
      }
      return res.json();
    },
    refetchInterval: 60_000,
  });

  const submitDecision = useMutation({
    mutationFn: async ({ decisionId, optionKey }: { decisionId: string; optionKey: string }) => {
      const res = await fetch(`/api/decisions/${decisionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedOption: optionKey }),
      });
      if (!res.ok) throw new Error('Failed to submit decision');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Loading your arena...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to Blooper Arena</h2>
        <p className="text-muted-foreground mb-6">
          Create a character and join a season to start competing.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/character/create">
            <Button>Create Character</Button>
          </Link>
          <Link href="/season">
            <Button variant="outline">Browse Seasons</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {data.season && (
            <p className="text-sm text-muted-foreground">
              {data.season.name} &middot; {data.season.daysRemaining} days remaining
            </p>
          )}
        </div>
      </div>

      <StatsOverview
        cash={data.player.cash}
        netWorth={data.player.netWorth}
        rank={data.player.rank}
        rankChange={data.player.rankChange}
        reputation={data.player.reputation}
        energy={data.player.energy}
        maxEnergy={data.player.maxEnergy}
        level={data.player.level}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <div className="space-y-6">
          <PendingDecisions
            decisions={data.decisions}
            currentEnergy={data.player.energy}
            onSubmit={async (decisionId, optionKey) => {
              await submitDecision.mutateAsync({ decisionId, optionKey });
            }}
          />
          <WhileYouWereAway events={data.events} />
        </div>
        <div className="space-y-4">
          <EnergyBar current={data.player.energy} max={data.player.maxEnergy} />
          <Card>
            <CardContent className="p-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-bold">{data.player.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cash</span>
                  <span className="font-mono">{data.player.cash.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Debt</span>
                  <span className="font-mono text-destructive">
                    {data.player.debt.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Influence</span>
                  <span className="font-bold">{data.player.influence}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Link href="/leaderboard" className="block">
            <Button variant="outline" className="w-full">
              View Full Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
