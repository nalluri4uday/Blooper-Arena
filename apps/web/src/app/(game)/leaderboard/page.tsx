'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';

interface LeaderboardData {
  entries: Array<{
    rank: number;
    previousRank: number | null;
    characterId: string;
    displayName: string;
    netWorth: number;
    level: number;
    score: number;
  }>;
  cursor: string | null;
  hasMore: boolean;
  seasonName: string;
  totalPlayers: number;
  userPosition?: {
    rank: number;
    netWorth: number;
  };
}

export default function LeaderboardPage() {
  const { data, isLoading } = useQuery<LeaderboardData>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard/active');
      if (!res.ok) throw new Error('Failed to load leaderboard');
      return res.json();
    },
    refetchInterval: 300_000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Loading leaderboard...</div>
      </div>
    );
  }

  if (!data || data.entries.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">No Active Season</h2>
        <p className="text-muted-foreground">
          The leaderboard will appear once a season starts and players begin competing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">
            {data.seasonName} &middot; {data.totalPlayers.toLocaleString()} players
          </p>
        </div>
        {data.userPosition && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Your Position</p>
            <p className="text-lg font-bold text-primary">#{data.userPosition.rank}</p>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <LeaderboardTable entries={data.entries} />
          {data.hasMore && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
