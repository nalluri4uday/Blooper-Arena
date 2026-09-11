import { describe, it, expect } from 'vitest';
import { validateTrade, calculateTradeAmount, calculateAvgBuyPrice } from '../trading.js';

describe('validateTrade', () => {
  const baseParams = {
    symbol: 'AAPL',
    side: 'buy' as const,
    quantity: 10,
    currentPrice: 150,
    availableCash: 100000,
    currentHoldingQuantity: 0,
    portfolioTotalValue: 100000,
    currentHoldingValue: 0,
  };

  it('should validate a valid buy trade', () => {
    expect(validateTrade(baseParams)).toEqual({ valid: true });
  });

  it('should reject buy with insufficient cash', () => {
    const result = validateTrade({ ...baseParams, availableCash: 100 });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Insufficient cash');
  });

  it('should reject zero quantity', () => {
    const result = validateTrade({ ...baseParams, quantity: 0 });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('positive integer');
  });

  it('should reject fractional quantity', () => {
    const result = validateTrade({ ...baseParams, quantity: 1.5 });
    expect(result.valid).toBe(false);
  });

  it('should reject sell with insufficient shares', () => {
    const result = validateTrade({
      ...baseParams,
      side: 'sell',
      currentHoldingQuantity: 5,
      quantity: 10,
    });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Insufficient shares');
  });

  it('should validate a valid sell trade', () => {
    const result = validateTrade({
      ...baseParams,
      side: 'sell',
      currentHoldingQuantity: 20,
      quantity: 10,
    });
    expect(result).toEqual({ valid: true });
  });

  it('should reject exceeding 50% single stock allocation', () => {
    const result = validateTrade({
      ...baseParams,
      quantity: 400,
      currentPrice: 150,
      portfolioTotalValue: 100000,
      currentHoldingValue: 30000,
    });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('50%');
  });

  it('should reject empty symbol', () => {
    const result = validateTrade({ ...baseParams, symbol: '' });
    expect(result.valid).toBe(false);
  });
});

describe('calculateTradeAmount', () => {
  it('should include slippage', () => {
    const amount = calculateTradeAmount(100, 10);
    expect(amount).toBeCloseTo(1001, 2); // 100 * 10 * 1.001
  });
});

describe('calculateAvgBuyPrice', () => {
  it('should calculate weighted average', () => {
    const avg = calculateAvgBuyPrice(10, 100, 10, 120);
    expect(avg).toBe(110);
  });

  it('should handle zero existing quantity', () => {
    const avg = calculateAvgBuyPrice(0, 0, 10, 150);
    expect(avg).toBe(150);
  });
});
