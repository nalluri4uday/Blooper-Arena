'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DecisionOption {
  key: string;
  label: string;
  description?: string;
  energyCost?: number;
}

interface Decision {
  id: string;
  prompt: string;
  options: DecisionOption[];
  expiresAt: string;
  energyCost: number;
}

interface PendingDecisionsProps {
  decisions: Decision[];
  currentEnergy: number;
  onSubmit: (decisionId: string, optionKey: string) => Promise<void>;
}

export function PendingDecisions({ decisions, currentEnergy, onSubmit }: PendingDecisionsProps) {
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(
    decisions.length > 0 ? decisions[0].id : null,
  );

  async function handleSubmit(decisionId: string, optionKey: string) {
    setSubmitting(`${decisionId}-${optionKey}`);
    try {
      await onSubmit(decisionId, optionKey);
    } finally {
      setSubmitting(null);
    }
  }

  if (decisions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Decisions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No decisions waiting. New opportunities will appear as the world progresses.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Pending Decisions</CardTitle>
          <Badge variant="secondary">{decisions.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {decisions.map((decision) => {
          const isExpanded = expandedId === decision.id;
          const hoursLeft = Math.max(
            0,
            Math.floor((new Date(decision.expiresAt).getTime() - Date.now()) / 3600000),
          );

          return (
            <div
              key={decision.id}
              className="rounded-lg border border-border overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : decision.id)}
                className="flex w-full items-center gap-3 p-3 text-left hover:bg-accent/50 transition-colors"
              >
                <ChevronRight
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform',
                    isExpanded && 'rotate-90',
                  )}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{decision.prompt}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {hoursLeft}h left
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border p-3 space-y-2">
                  {decision.options.map((option) => {
                    const cost = option.energyCost ?? decision.energyCost;
                    const canAfford = currentEnergy >= cost;
                    const isSubmittingThis = submitting === `${decision.id}-${option.key}`;

                    return (
                      <Button
                        key={option.key}
                        variant={canAfford ? 'outline' : 'ghost'}
                        className="w-full justify-between h-auto py-2"
                        disabled={!canAfford || submitting !== null}
                        onClick={() => handleSubmit(decision.id, option.key)}
                      >
                        <div className="text-left">
                          <span className="font-medium">{option.label}</span>
                          {option.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {option.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Zap className="h-3 w-3" />
                          {cost}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
