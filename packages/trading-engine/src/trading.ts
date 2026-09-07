import type { TradeParams, TradeValidation } from './types';

const MAX_SINGLE_STOCK_ALLOCATION = 0.5; // 50% of portfolio
const SLIPPAGE_RATE = 0.001; // 0.1%

export function validateTrade(params: TradeParams): TradeValidation {
  const { symbol, side, quantity, currentPrice, availableCash, currentHoldingQuantity, portfolioTotalValue, currentHoldingValue } = params;

  if (!symbol || symbol.trim() === '') {
    return { valid: false, reason: 'Symbol is required' };
  }

  if (quantity <= 0 || !Number.isInteger(quantity)) {
    return { valid: false, reason: 'Quantity must be a positive integer' };
  }

  if (currentPrice <= 0) {
    return { valid: false, reason: 'Invalid stock price' };
  }

  if (side === 'buy') {
    const totalCost = calculateTradeAmount(currentPrice, quantity);
    if (totalCost > availableCash) {
      return { valid: false, reason: `Insufficient cash. Need ₹${totalCost.toFixed(2)}, have ₹${availableCash.toFixed(2)}` };
    }

    // Check max allocation
    const newHoldingValue = currentHoldingValue + (currentPrice * quantity);
    const newPortfolioValue = portfolioTotalValue + (currentPrice * quantity); // approximate
    if (newHoldingValue / newPortfolioValue > MAX_SINGLE_STOCK_ALLOCATION) {
      return { valid: false, reason: `Cannot exceed ${MAX_SINGLE_STOCK_ALLOCATION * 100}% allocation in a single stock` };
    }
  }

  if (side === 'sell') {
    if (quantity > currentHoldingQuantity) {
      return { valid: false, reason: `Insufficient shares. Have ${currentHoldingQuantity}, trying to sell ${quantity}` };
    }
  }

  return { valid: true };
}

export function calculateTradeAmount(price: number, quantity: number): number {
  return price * quantity * (1 + SLIPPAGE_RATE);
}

export function calculateAvgBuyPrice(
  existingQty: number,
  existingAvg: number,
  newQty: number,
  newPrice: number,
): number {
  if (existingQty + newQty === 0) return 0;
  return ((existingQty * existingAvg) + (newQty * newPrice)) / (existingQty + newQty);
}
