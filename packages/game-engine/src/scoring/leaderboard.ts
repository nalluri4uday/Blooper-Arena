import { PlayerScore, RankedPlayer } from './types.js';

/**
 * Calculate a composite score for a player.
 * Primarily based on net worth, with small bonuses for level and reputation.
 */
export function calculateScore(player: PlayerScore): number {
  return player.netWorth + (player.level * 1000) + (player.reputation * 100);
}

/**
 * Rank a list of players by their composite score.
 * Returns players sorted descending by score with rank assignments.
 * If previousRanks is provided, rank changes are tracked.
 */
export function rankPlayers(
  players: PlayerScore[],
  previousRanks?: Map<string, number>,
): RankedPlayer[] {
  // Calculate scores and sort
  const scored = players.map((player) => ({
    characterId: player.characterId,
    netWorth: player.netWorth,
    score: calculateScore(player),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Assign ranks
  return scored.map((player, index) => ({
    characterId: player.characterId,
    rank: index + 1,
    previousRank: previousRanks?.get(player.characterId) ?? null,
    netWorth: player.netWorth,
    score: player.score,
  }));
}

/**
 * Extract a map of characterId -> rank from a ranked player list.
 * Useful for storing previous ranks between ranking computations.
 */
export function extractRankMap(ranked: RankedPlayer[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const player of ranked) {
    map.set(player.characterId, player.rank);
  }
  return map;
}
