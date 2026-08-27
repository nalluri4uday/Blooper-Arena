import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import {
  characters,
  seasons,
  seasonPlayers,
  events,
  decisions,
  leaderboardSnapshots,
} from '@blooper-arena/database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();

  // Find user's character
  const userChars = await db
    .select()
    .from(characters)
    .where(eq(characters.userId, session.user.id))
    .limit(1);

  if (userChars.length === 0) {
    return NextResponse.json(null, { status: 404 });
  }

  const characterId = userChars[0].id;

  // Find active season participation
  const activeSeason = await db
    .select()
    .from(seasons)
    .where(eq(seasons.status, 'active'))
    .limit(1);

  if (activeSeason.length === 0) {
    return NextResponse.json(null, { status: 404 });
  }

  const seasonId = activeSeason[0].id;

  const playerData = await db
    .select()
    .from(seasonPlayers)
    .where(
      and(
        eq(seasonPlayers.seasonId, seasonId),
        eq(seasonPlayers.characterId, characterId),
      ),
    )
    .limit(1);

  if (playerData.length === 0) {
    return NextResponse.json(null, { status: 404 });
  }

  const player = playerData[0];

  // Get recent events
  const recentEvents = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.seasonId, seasonId),
        eq(events.actorId, characterId),
      ),
    )
    .orderBy(desc(events.createdAt))
    .limit(20);

  // Get pending decisions
  const pendingDecisions = await db
    .select()
    .from(decisions)
    .where(
      and(
        eq(decisions.seasonId, seasonId),
        eq(decisions.characterId, characterId),
        eq(decisions.status, 'pending'),
      ),
    )
    .orderBy(desc(decisions.createdAt))
    .limit(5);

  // Get latest leaderboard position
  const latestSnapshot = await db
    .select()
    .from(leaderboardSnapshots)
    .where(
      and(
        eq(leaderboardSnapshots.seasonId, seasonId),
        eq(leaderboardSnapshots.characterId, characterId),
      ),
    )
    .orderBy(desc(leaderboardSnapshots.capturedAt))
    .limit(1);

  const rank = latestSnapshot.length > 0 ? latestSnapshot[0].rank : 0;
  const previousRank = latestSnapshot.length > 0 ? latestSnapshot[0].previousRank : null;
  const rankChange = previousRank != null ? previousRank - rank : 0;

  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (new Date(activeSeason[0].endsAt).getTime() - Date.now()) / 86400000,
    ),
  );

  return NextResponse.json({
    player: {
      cash: player.cash,
      netWorth: player.netWorth,
      debt: player.debt,
      energy: player.energy,
      maxEnergy: player.maxEnergy,
      reputation: player.reputation,
      influence: player.influence,
      level: player.level,
      rank,
      rankChange,
    },
    events: recentEvents.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      importance: e.importance,
      description:
        e.narrativeText ||
        (e.canonicalPayload as Record<string, unknown>)?.description ||
        e.eventType,
      createdAt: e.createdAt.toISOString(),
    })),
    decisions: pendingDecisions.map((d) => ({
      id: d.id,
      prompt: d.prompt,
      options: d.options,
      expiresAt: d.expiresAt.toISOString(),
      energyCost:
        (d.options as Array<{ energyCost?: number }>)?.[0]?.energyCost ?? 3,
    })),
    season: {
      name: activeSeason[0].name,
      endsAt: activeSeason[0].endsAt.toISOString(),
      daysRemaining,
    },
  });
}
