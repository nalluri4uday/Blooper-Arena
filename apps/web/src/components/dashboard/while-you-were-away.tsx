'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  TrendingUp,
  Handshake,
  AlertTriangle,
  Building,
  Sparkles,
  Users,
  BarChart3,
} from 'lucide-react';

const eventIcons: Record<string, React.ReactNode> = {
  job_offer: <Briefcase className="h-4 w-4" />,
  investment: <TrendingUp className="h-4 w-4" />,
  partnership: <Handshake className="h-4 w-4" />,
  risk_event: <AlertTriangle className="h-4 w-4" />,
  business_opportunity: <Building className="h-4 w-4" />,
  skill_challenge: <Sparkles className="h-4 w-4" />,
  social_event: <Users className="h-4 w-4" />,
  market_event: <BarChart3 className="h-4 w-4" />,
};

interface GameEvent {
  id: string;
  eventType: string;
  importance: number;
  description: string;
  createdAt: string;
}

interface WhileYouWereAwayProps {
  events: GameEvent[];
}

export function WhileYouWereAway({ events }: WhileYouWereAwayProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">While You Were Away</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nothing happened yet. Check back later!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">While You Were Away</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border border-border p-3 transition-colors',
                event.importance >= 75 && 'border-primary/30 bg-primary/5',
              )}
            >
              <div className="mt-0.5 text-muted-foreground">
                {eventIcons[event.eventType] ?? <BarChart3 className="h-4 w-4" />}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm">{event.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(new Date(event.createdAt))}
                  </span>
                  {event.importance >= 75 && (
                    <Badge variant="outline" className="text-xs">
                      Major
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
