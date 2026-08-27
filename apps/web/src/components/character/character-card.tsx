import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CharacterCardProps {
  displayName: string;
  attributes: {
    strategy: number;
    negotiation: number;
    riskAppetite: number;
    charisma: number;
    discipline: number;
    creativity: number;
  };
  level?: number;
  rank?: number;
  netWorth?: number;
}

const attrConfig = [
  { key: 'strategy', label: 'STR', color: 'text-blue-400' },
  { key: 'negotiation', label: 'NEG', color: 'text-green-400' },
  { key: 'riskAppetite', label: 'RSK', color: 'text-red-400' },
  { key: 'charisma', label: 'CHR', color: 'text-purple-400' },
  { key: 'discipline', label: 'DIS', color: 'text-yellow-400' },
  { key: 'creativity', label: 'CRE', color: 'text-pink-400' },
] as const;

export function CharacterCard({ displayName, attributes, level, rank, netWorth }: CharacterCardProps) {
  const topAttributes = attrConfig
    .map((a) => ({ ...a, value: attributes[a.key as keyof typeof attributes] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 2);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{displayName}</CardTitle>
          {level && <Badge variant="secondary">Lv.{level}</Badge>}
        </div>
        {rank && (
          <p className="text-sm text-muted-foreground">
            Rank #{rank}
            {netWorth !== undefined && ` · ${formatCompact(netWorth)}`}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {attrConfig.map((attr) => {
            const value = attributes[attr.key as keyof typeof attributes];
            return (
              <div key={attr.key} className="text-center">
                <div className={cn('text-xs font-medium', attr.color)}>{attr.label}</div>
                <div className="text-lg font-bold">{value}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex gap-1.5">
          {topAttributes.map((attr) => (
            <Badge key={attr.key} variant="outline" className={cn('text-xs', attr.color)}>
              {attr.label} {attr.value}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatCompact(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
