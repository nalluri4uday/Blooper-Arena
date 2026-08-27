'use client';

import { Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface EnergyBarProps {
  current: number;
  max: number;
  className?: string;
}

export function EnergyBar({ current, max, className }: EnergyBarProps) {
  const percent = Math.round((current / max) * 100);
  const isLow = percent < 20;
  const isMedium = percent >= 20 && percent < 50;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Zap className={cn('h-4 w-4', isLow ? 'text-destructive' : 'text-energy')} />
          <span className="font-medium">Energy</span>
        </div>
        <span
          className={cn(
            'font-mono font-bold',
            isLow ? 'text-destructive' : isMedium ? 'text-warning' : 'text-energy',
          )}
        >
          {current}/{max}
        </span>
      </div>
      <Progress
        value={percent}
        indicatorClassName={cn(
          isLow ? 'bg-destructive' : isMedium ? 'bg-warning' : 'bg-energy',
        )}
      />
      <p className="text-xs text-muted-foreground">
        Replenishes ~10 energy per hour
      </p>
    </div>
  );
}
