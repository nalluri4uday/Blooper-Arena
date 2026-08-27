import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
  seasons,
  seasonPlayers,
  leaderboardSnapshots,
  characters,
} from '@blooper-arena/database/schema';
import { eq, and, desc, sql, gt } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ season: string }> },
) {
  const { season: seasonParam } = await params;
  const db = getDb();

  // Support 'active' as a special season identifier
  let seasonId: string;
  let seasonData;

  if (seasonParam === 'active') {
    const active = await db
      .select()
      .from(seasons)
      .where(eq(seasons.status, 'active'))
      .limit(1);

    if (active.length === 0) {
      return NextResponse.json(
        { entries: [], hasMore: false, seasonName: '', totalPlayers: 0 },
      );
    }
    seasonId = active[0].id;
    seasonData = active[0];
  } else {
    seasonId = seasonParam;
    const s = await db
      .select()
      .from(seasons)
      .where(eq(seasons.id, seasonId))
      .limit(1);

    if (s.length === 0) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }
    seasonData = s[0];
  }

  // Get cursor from query params
  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

  // Get latest snapshot timestamp
  const latestSnapshot = await db
    .select({ capturedAt: leaderboardSnapshots.capturedAt })
    .from(leaderboardSnapshots)
    .where(eq(leaderboardSnapshots.seasonId, seasonId))
    .orderBy(desc(leaderboardSnapshots.capturedAt))
    .limit(1);

  if (latestSnapshot.length === 0) {
    // No snapshots yet — build leaderboard from season_players directly
    const players = await db
      .select({
        characterId: seasonPlayers.characterId,
        netWorth: seasonPlayers.netWorth,
        level: seasonPlayers.level,
      })
      .from(seasonPlayers)
      .where(eq(seasonPlayers.seasonId, seasonId))
      .orderBy(desc(seasonPlayers.netWorth))
      .limit(limit);

    // Get character names
    const charIds = players.map((p) => p.characterId);
    const charNames = charIds.length > 0
      ? await db
          .select({ id: characters.id, displayName: characters.displayName })
          .from(characters)
          .where(sql`${characters.id} = ANY(${charIds})`)
      : [];
    const nameMap = new Map(charNames.map((c) => [c.id, c.displayName]));

    const entries = players.map((p, i) => ({
      rank: i + 1,
      previousRank: null,
      characterId: p.characterId,
      displayName: nameMap.get(p.characterId) || 'Unknown',
      netWorth: p.netWorth,
      level: p.level,
      score: p.netWorth,
    }));

    return NextResponse.json({
      entries,
      cursor: null,
      hasMore: false,
      seasonName: seasonData.name,
      totalPlayers: players.length,
    });
  }

  const snapshotTime = latestSnapshot[0].capturedAt;

  // Fetch leaderboard entries
  const query = db
    .select()
    .from(leaderboardSnapshots)
    .where(
      and(
        eq(leaderboardSnapshots.seasonId, seasonId),
        eq(leaderboardSnapshots.capturedAt, snapshotTime),
        cursor ? gt(leaderboardSnapshots.rank, parseInt(cursor)) : undefined,
      ),
    )
    .orderBy(leaderboardSnapshots.rank)
    .limit(limit + 1);

  const rows = await query;
  const hasMore = rows.length > limit;
  const entries = rows.slice(0, limit);

  // Get character names
  const charIds = entries.map((e) => e.characterId);
  const charNames = charIds.length > 0
    ? await db
        .select({ id: characters.id, displayName: characters.displayName })
        .from(characters)
        .where(sql`${characters.id} = ANY(${charIds})`)
    : [];
  const nameMap = new Map(charNames.map((c) => [c.id, c.displayName]));

  // Count total players
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(seasonPlayers)
    .where(eq(seasonPlayers.seasonId, seasonId));
  const totalPlayers = countResult[0]?.count ?? 0;

  return NextResponse.json({
    entries: entries.map((e) => ({
      rank: e.rank,
      previousRank: e.previousRank,
      characterId: e.characterId,
      displayName: nameMap.get(e.characterId) || 'Unknown',
      netWorth: e.netWorth,
      level: 0,
      score: e.score,
    })),
    cursor: hasMore ? entries[entries.length - 1].rank.toString() : null,
    hasMore,
    seasonName: seasonData.name,
    totalPlayers,
  });
}
