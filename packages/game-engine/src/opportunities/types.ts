export interface PlayerContext {
  characterId: string;
  seasonId: string;
  level: number;
  energy: number;
  cash: number;
  netWorth: number;
  reputation: number;
  attributes: {
    strategy: number;
    negotiation: number;
    riskAppetite: number;
    charisma: number;
    discipline: number;
    creativity: number;
  };
  activeOpportunityCount: number;
  activeBusinessCount: number;
  cooldowns: Map<string, Date>; // eventType -> last generated at
}

export interface GeneratedOpportunity {
  id: string;
  seasonId: string;
  characterId: string;
  type: string;
  importance: number;
  energyCost: number;
  payload: Record<string, unknown>;
  expiresAt: Date;
}
