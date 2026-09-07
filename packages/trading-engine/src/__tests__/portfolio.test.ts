import { describe, it, expect } from 'vitest';
import { calculateHoldingValue, calculateHoldingPnl, calculatePortfolioSummary } from '../portfolio';

describe('calculateHoldingValue', () => {
  it('should multiply quantity by price', () => {
    expect(calculateHoldingValue(10, 150)).toBe(1500);
  });
});

describe('calculateHoldingPnl', () => {
  it('should calculate positive PnL', () => {
    const result = calculateHoldingPnl(10, 100, 120);
    expect(result.pnl).toBe(200);
    expect(result.pnlPercent).toBe(20);
  });

  it('should calculate negative PnL', () => {
    const result = calculateHoldingPnl(10, 100, 80);
    expect(result.pnl).toBe(-200);
    expect(result.pnlPercent).toBe(-20);
  });
});

describe('calculatePortfolioSummary', () => {
  it('should calculate correct totals', () => {
    const result = calculatePortfolioSummary(500000, [
      { symbol: 'AAPL', quantity: 10, avgBuyPrice: 100, currentPrice: 120 },
      { symbol: 'MSFT', quantity: 5, avgBuyPrice: 200, currentPrice: 180 },
    ], 1000000);

    expect(result.cash).toBe(500000);
    expect(result.holdingsValue).toBe(10 * 120 + 5 * 180); // 1200 + 900 = 2100
    expect(result.totalValue).toBe(502100);
    expect(result.totalPnl).toBe(502100 - 1000000);
  });
});
