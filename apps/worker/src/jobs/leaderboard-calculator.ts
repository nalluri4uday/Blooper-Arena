import {
  seasons,
  seasonPlayers,
  leaderboardSnapshots,
  characters,
} from '@blooper-arena/database/schema';
import { eq, desc, sql } from 'drizzle-orm';

type Db = ReturnType<typeof import('@blooper-arena/database/client').createPooledDb>;

export async function calculateLeaderboard(db: Db): Promise<void> {
  // Find active season
  const activeSeason = await db
    .select()
    .from(seasons)
    .where(eq(seasons.status, 'active'))
    .limit(1);

  if (activeSeason.length === 0) return;

  const seasonId = activeSeason[0].id;
  const capturedAt = new Date();

  // Get all players sorted by net worth
  const players = await db
    .select({
      characterId: seasonPlayers.characterId,
      netWorth: seasonPlayers.netWorth,
      level: seasonPlayers.level,
      reputation: seasonPlayers.reputation,
    })
    .from(seasonPlayers)
    .where(eq(seasonPlayers.seasonId, seasonId))
    .orderBy(desc(seasonPlayers.netWorth));

  if (players.length === 0) return;

  // Get previous snapshot for rank change tracking
  const previousSnapshot = await db
    .select({
      characterId: leaderboardSnapshots.characterId,
      rank: leaderboardSnapshots.rank,
    })
    .from(leaderboardSnapshots)
    .where(eq(leaderboardSnapshots.seasonId, seasonId))
    .orderBy(desc(leaderboardSnapshots.capturedAt))
    .limit(players.length);

  const previousRankMap = new Map<string, number>();
  for (const snap of previousSnapshot) {
    if (!previousRankMap.has(snap.characterId)) {
      previousRankMap.set(snap.characterId, snap.rank);
    }
  }

  // Insert new snapshot
  const snapshotRows = players.map((player, index) => {
    const rank = index + 1;
    const score = player.netWorth + player.level * 1000 + player.reputation * 100;
    return {
      id: crypto.randomUUID(),
      seasonId,
      characterId: player.characterId,
      rank,
      previousRank: previousRankMap.get(player.characterId) ?? null,
      netWorth: player.netWorth,
      score,
      capturedAt,
    };
  });

  // Batch insert in chunks to avoid memory issues
  const CHUNK_SIZE = 100;
  for (let i = 0; i < snapshotRows.length; i += CHUNK_SIZE) {
    const chunk = snapshotRows.slice(i, i + CHUNK_SIZE);
    await db.insert(leaderboardSnapshots).values(chunk);
  }
}
