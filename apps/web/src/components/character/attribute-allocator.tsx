'use client';

import { useState, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const ATTRIBUTE_TOTAL = 100;

interface AttributeConfig {
  key: string;
  label: string;
  description: string;
  color: string;
}

const ATTRIBUTES: AttributeConfig[] = [
  {
    key: 'strategy',
    label: 'Strategy',
    description: 'Planning, long-term thinking, market analysis',
    color: 'bg-blue-500',
  },
  {
    key: 'negotiation',
    label: 'Negotiation',
    description: 'Deal-making, persuasion, closing agreements',
    color: 'bg-green-500',
  },
  {
    key: 'riskAppetite',
    label: 'Risk Appetite',
    description: 'Willingness to take big bets for bigger rewards',
    color: 'bg-red-500',
  },
  {
    key: 'charisma',
    label: 'Charisma',
    description: 'Social influence, networking, public image',
    color: 'bg-purple-500',
  },
  {
    key: 'discipline',
    label: 'Discipline',
    description: 'Consistency, risk management, cost control',
    color: 'bg-yellow-500',
  },
  {
    key: 'creativity',
    label: 'Creativity',
    description: 'Innovation, spotting opportunities, unique strategies',
    color: 'bg-pink-500',
  },
];

export interface AttributeValues {
  strategy: number;
  negotiation: number;
  riskAppetite: number;
  charisma: number;
  discipline: number;
  creativity: number;
}

interface AttributeAllocatorProps {
  values: AttributeValues;
  onChange: (values: AttributeValues) => void;
}

export function AttributeAllocator({ values, onChange }: AttributeAllocatorProps) {
  const totalUsed = Object.values(values).reduce((sum, v) => sum + v, 0);
  const remaining = ATTRIBUTE_TOTAL - totalUsed;

  const handleChange = useCallback(
    (key: string, newValue: number) => {
      const currentValue = values[key as keyof AttributeValues];
      const delta = newValue - currentValue;
      const otherTotal = totalUsed - currentValue;
      const maxAllowed = ATTRIBUTE_TOTAL - otherTotal;
      const clampedValue = Math.min(Math.max(0, newValue), maxAllowed);

      onChange({
        ...values,
        [key]: clampedValue,
      });
    },
    [values, onChange, totalUsed],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Allocate Attributes</h3>
        <div
          className={cn(
            'rounded-full px-3 py-1 text-sm font-bold',
            remaining === 0
              ? 'bg-success/20 text-success'
              : remaining < 0
                ? 'bg-destructive/20 text-destructive'
                : 'bg-warning/20 text-warning',
          )}
        >
          {remaining} points remaining
        </div>
      </div>

      <div className="space-y-5">
        {ATTRIBUTES.map((attr) => {
          const value = values[attr.key as keyof AttributeValues];
          return (
            <div key={attr.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <div className={cn('h-2 w-2 rounded-full', attr.color)} />
                  {attr.label}
                </Label>
                <span className="text-sm font-mono font-bold text-foreground w-8 text-right">
                  {value}
                </span>
              </div>
              <Slider
                value={[value]}
                onValueChange={([v]) => handleChange(attr.key, v)}
                max={ATTRIBUTE_TOTAL}
                min={0}
                step={1}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">{attr.description}</p>
            </div>
          );
        })}
      </div>

      {/* Visual summary */}
      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-secondary">
        {ATTRIBUTES.map((attr) => {
          const value = values[attr.key as keyof AttributeValues];
          const percent = (value / ATTRIBUTE_TOTAL) * 100;
          if (percent === 0) return null;
          return (
            <div
              key={attr.key}
              className={cn(attr.color, 'transition-all duration-200')}
              style={{ width: `${percent}%` }}
              title={`${attr.label}: ${value}`}
            />
          );
        })}
      </div>
    </div>
  );
}
