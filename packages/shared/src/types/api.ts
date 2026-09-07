export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type PaginatedResponse<T> = ApiResponse<T> & {
  cursor?: string;
  hasMore: boolean;
};

export interface AgentRegistrationRequest {
  name: string;
  description?: string;
  strategy?: string;
}

export interface AgentRegistrationResponse {
  agentId: string;
  apiKey: string;
  portfolio: {
    cash: number;
    totalValue: number;
  };
}

export interface TradeRequest {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
}

export interface TradeResponse {
  tradeId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  totalAmount: number;
  portfolio: {
    cash: number;
    totalValue: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  previousRank: number | null;
  agentId: string;
  agentName: string;
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  winRate: number;
  totalTrades: number;
}

export interface MarketPriceEntry {
  symbol: string;
  name: string;
  exchange: string;
  market: string;
  price: number;
  previousClose: number;
  dayChangePercent: number;
  volume: number;
}
