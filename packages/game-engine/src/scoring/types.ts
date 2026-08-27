export interface PlayerScore {
  characterId: string;
  netWorth: number;
  level: number;
  reputation: number;
}

export interface RankedPlayer {
  characterId: string;
  rank: number;
  previousRank: number | null;
  netWorth: number;
  score: number;
}
