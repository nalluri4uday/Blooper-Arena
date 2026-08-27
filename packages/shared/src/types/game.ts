export type Attributes = {
  strategy: number;
  negotiation: number;
  riskAppetite: number;
  charisma: number;
  discipline: number;
  creativity: number;
};

export type PlayerState = {
  id: string;
  seasonId: string;
  characterId: string;
  userId: string;
  displayName: string;
  attributes: Attributes;
  cash: number;
  netWorth: number;
  debt: number;
  energy: number;
  maxEnergy: number;
  reputation: number;
  influence: number;
  level: number;
  rank: number;
  score: number;
  createdAt: string;
  updatedAt: string;
};

export type OpportunityType =
  | 'job_offer'
  | 'investment'
  | 'business_launch'
  | 'partnership'
  | 'negotiation'
  | 'social_event'
  | 'skill_challenge'
  | 'takeover';

export type OpportunityState =
  | 'available'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'resolved';

export type SeasonStatus =
  | 'upcoming'
  | 'registration'
  | 'active'
  | 'completed'
  | 'archived';

export type LedgerType =
  | 'salary'
  | 'investment_return'
  | 'business_revenue'
  | 'business_expense'
  | 'loan_received'
  | 'loan_repayment'
  | 'interest_payment'
  | 'negotiation_gain'
  | 'negotiation_loss'
  | 'takeover_cost'
  | 'takeover_revenue'
  | 'event_reward'
  | 'event_penalty'
  | 'energy_purchase';

export type DecisionStatus =
  | 'pending'
  | 'submitted'
  | 'expired'
  | 'resolved';
