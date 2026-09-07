export interface QuoteData {
  symbol: string;
  price: number;
  previousClose: number;
  dayChangePercent: number;
  volume: number;
  marketCap: number | null;
}

export interface StockInfo {
  symbol: string;
  name: string;
  exchange: string; // NSE, NYSE, NASDAQ
  market: 'IN' | 'US';
}

export interface TradeValidation {
  valid: boolean;
  reason?: string;
}

export interface TradeParams {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  currentPrice: number;
  availableCash: number;
  currentHoldingQuantity: number;
  portfolioTotalValue: number;
  currentHoldingValue: number;
}

export interface HoldingData {
  symbol: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
}

export interface PortfolioSummary {
  cash: number;
  holdingsValue: number;
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayPnl: number;
}

export interface MarketStatus {
  india: 'open' | 'closed' | 'pre-market';
  us: 'open' | 'closed' | 'pre-market';
}
