import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { seasons, seasonPlayers } from '@blooper-arena/database/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  const db = getDb();

  const allSeasons = await db
    .select()
    .from(seasons)
    .orderBy(desc(seasons.startsAt));

  // Get player counts per season
  const counts = await db
    .select({
      seasonId: seasonPlayers.seasonId,
      count: sql<number>`count(*)`,
    })
    .from(seasonPlayers)
    .groupBy(seasonPlayers.seasonId);

  const countMap = new Map(counts.map((c) => [c.seasonId, c.count]));

  // Check if current user has joined each season
  let joinedSeasons = new Set<string>();
  try {
    const session = await getAuth().api.getSession({ headers: await headers() });
    if (session) {
      const userChars = await db
        .select({ id: sql<string>`c.id` })
        .from(sql`characters c`)
        .where(sql`c.user_id = ${session.user.id}`);

      if (userChars.length > 0) {
        const charIds = userChars.map((c) => c.id);
        const joined = await db
          .select({ seasonId: seasonPlayers.seasonId })
          .from(seasonPlayers)
          .where(sql`${seasonPlayers.characterId} = ANY(${charIds})`);

        joinedSeasons = new Set(joined.map((j) => j.seasonId));
      }
    }
  } catch {
    // Not authenticated, that's fine
  }

  return NextResponse.json({
    seasons: allSeasons.map((s) => ({
      id: s.id,
      name: s.name,
      status: s.status,
      startingCapital: s.startingCapital,
      targetNetWorth: s.targetNetWorth,
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
      playerCount: countMap.get(s.id) ?? 0,
      maxPlayers: s.maxPlayers,
      isJoined: joinedSeasons.has(s.id),
    })),
  });
}
