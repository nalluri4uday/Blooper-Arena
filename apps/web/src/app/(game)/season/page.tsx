'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Target, Clock } from 'lucide-react';

interface Season {
  id: string;
  name: string;
  status: string;
  startingCapital: number;
  targetNetWorth: number;
  startsAt: string;
  endsAt: string;
  playerCount: number;
  maxPlayers: number;
  isJoined: boolean;
}

const statusColors: Record<string, string> = {
  upcoming: 'warning',
  registration: 'success',
  active: 'default',
  completed: 'secondary',
} as const;

export default function SeasonPage() {
  const queryClient = useQueryClient();

  const { data: seasons, isLoading } = useQuery<Season[]>({
    queryKey: ['seasons'],
    queryFn: async () => {
      const res = await fetch('/api/seasons');
      if (!res.ok) throw new Error('Failed to load seasons');
      const data = await res.json();
      return data.seasons;
    },
  });

  const joinSeason = useMutation({
    mutationFn: async ({ seasonId, characterId }: { seasonId: string; characterId: string }) => {
      const res = await fetch(`/api/seasons/${seasonId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to join season');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasons'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Loading seasons...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Seasons</h1>
        <p className="text-sm text-muted-foreground">
          Join a season to start competing. Each season is a fresh 30-day competition.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {seasons?.map((season) => (
          <Card key={season.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{season.name}</CardTitle>
                <Badge
                  variant={
                    (statusColors[season.status] as 'default' | 'secondary' | 'destructive' | 'outline') ??
                    'secondary'
                  }
                >
                  {season.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>Target: {(season.targetNetWorth / 10_000_000).toFixed(0)}Cr</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {season.playerCount}/{season.maxPlayers}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(season.startsAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {Math.ceil(
                      (new Date(season.endsAt).getTime() - new Date(season.startsAt).getTime()) /
                        86400000,
                    )}{' '}
                    days
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {season.isJoined ? (
                <Badge variant="outline">Joined</Badge>
              ) : (season.status === 'registration' || season.status === 'active') ? (
                <Button
                  size="sm"
                  disabled={joinSeason.isPending}
                  onClick={() => {
                    // In a full implementation, this would show a character picker dialog
                    // For now, we'll pass a placeholder that the API will resolve
                    joinSeason.mutate({ seasonId: season.id, characterId: 'latest' });
                  }}
                >
                  {joinSeason.isPending ? 'Joining...' : 'Join Season'}
                </Button>
              ) : null}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
