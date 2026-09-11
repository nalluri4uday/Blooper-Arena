import type { HoldingData, PortfolioSummary } from './types.js';

export function calculateHoldingValue(quantity: number, currentPrice: number): number {
  return quantity * currentPrice;
}

export function calculateHoldingPnl(quantity: number, avgBuyPrice: number, currentPrice: number): { pnl: number; pnlPercent: number } {
  const pnl = (currentPrice - avgBuyPrice) * quantity;
  const pnlPercent = avgBuyPrice > 0 ? ((currentPrice - avgBuyPrice) / avgBuyPrice) * 100 : 0;
  return { pnl, pnlPercent };
}

export function calculatePortfolioSummary(
  cash: number,
  holdings: HoldingData[],
  startingCapital: number = 1000000,
): PortfolioSummary {
  let holdingsValue = 0;
  let totalCostBasis = 0;

  for (const h of holdings) {
    holdingsValue += h.quantity * h.currentPrice;
    totalCostBasis += h.quantity * h.avgBuyPrice;
  }

  const totalValue = cash + holdingsValue;
  const totalPnl = totalValue - startingCapital;
  const totalPnlPercent = startingCapital > 0 ? ((totalValue - startingCapital) / startingCapital) * 100 : 0;

  // Day PnL requires previous day's portfolio value — simplified here as holdings unrealized P&L
  const dayPnl = holdingsValue - totalCostBasis;

  return {
    cash,
    holdingsValue,
    totalValue,
    totalPnl,
    totalPnlPercent,
    dayPnl,
  };
}
