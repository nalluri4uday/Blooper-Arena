import type { Attributes } from './game';

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type PaginatedResponse<T> = ApiResponse<T> & {
  cursor?: string;
  hasMore: boolean;
};

export type PlayerStats = {
  cash: number;
  netWorth: number;
  debt: number;
  energy: number;
  maxEnergy: number;
  reputation: number;
  influence: number;
  level: number;
  rank: number;
  rankChange: number;
};

export type EventSummary = {
  id: string;
  eventType: string;
  importance: number;
  description: string;
  createdAt: string;
};

export type DecisionOption = {
  key: string;
  label: string;
  description?: string;
  energyCost?: number;
};

export type DecisionSummary = {
  id: string;
  prompt: string;
  options: DecisionOption[];
  expiresAt: string;
  energyCost: number;
};

export type LeaderboardEntry = {
  rank: number;
  previousRank: number;
  characterId: string;
  displayName: string;
  netWorth: number;
  level: number;
  score: number;
};

export type DashboardResponse = {
  player: PlayerStats;
  events: EventSummary[];
  decisions: DecisionSummary[];
  leaderboardPosition: LeaderboardEntry | null;
};

export type CharacterPublic = {
  id: string;
  displayName: string;
  attributes: Attributes;
  level: number;
  rank: number;
};
