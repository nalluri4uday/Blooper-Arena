export interface LedgerOperation {
  seasonId: string;
  characterId: string;
  type: string; // matches LedgerType enum from shared
  amount: number; // positive = credit, negative = debit
  currentBalance: number;
  referenceId?: string;
  description?: string;
}

export interface LedgerEntry {
  id: string;
  seasonId: string;
  characterId: string;
  type: string;
  amount: number;
  balanceAfter: number;
  referenceId?: string;
  description?: string;
}

export interface NetWorthComponents {
  cash: number;
  businessValuations: number;
  debt: number;
}
