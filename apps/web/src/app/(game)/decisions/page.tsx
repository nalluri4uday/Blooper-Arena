'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PendingDecisions } from '@/components/dashboard/pending-decisions';

export default function DecisionsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/me/dashboard');
      if (!res.ok) return null;
      return res.json();
    },
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
        <div className="text-muted-foreground">Loading decisions...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Decisions</h1>
        <p className="text-sm text-muted-foreground">
          Make strategic choices to grow your wealth. Each decision costs energy.
        </p>
      </div>

      <PendingDecisions
        decisions={data?.decisions ?? []}
        currentEnergy={data?.player?.energy ?? 0}
        onSubmit={async (decisionId, optionKey) => {
          await submitDecision.mutateAsync({ decisionId, optionKey });
        }}
      />
    </div>
  );
}
