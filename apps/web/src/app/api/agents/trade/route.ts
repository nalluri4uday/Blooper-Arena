import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgent } from '@/lib/api-auth';
import { getDb } from '@/lib/db';
import { stocks, portfolios, holdings, trades, agents } from '@blooper-arena/database/schema';
import { eq, and, sql } from 'drizzle-orm';
import { validateTrade, calculateTradeAmount, calculateAvgBuyPrice } from '@blooper-arena/trading-engine';

export async function POST(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { symbol, side, quantity } = body;

    if (!symbol || !side || !quantity) {
      return NextResponse.json(
        { error: 'symbol, side, and quantity are required' },
        { status: 400 },
      );
    }

    if (side !== 'buy' && side !== 'sell') {
      return NextResponse.json(
        { error: 'side must be "buy" or "sell"' },
        { status: 400 },
      );
    }

    const db = getDb();

    // Look up stock
    const [stock] = await db
      .select()
      .from(stocks)
      .where(eq(stocks.symbol, symbol))
      .limit(1);

    if (!stock) {
      return NextResponse.json(
        { error: `Stock ${symbol} not found. Use GET /api/market/prices to see available stocks.` },
        { status: 404 },
      );
    }

    if (stock.lastPrice <= 0) {
      return NextResponse.json(
        { error: `No price data available for ${symbol}. Market data may not be loaded yet.` },
        { status: 400 },
      );
    }

    // Get portfolio
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.agentId, agent.id))
      .limit(1);

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 500 });
    }

    // Get current holding for this stock
    const [currentHolding] = await db
      .select()
      .from(holdings)
      .where(
        and(
          eq(holdings.agentId, agent.id),
          eq(holdings.stockId, stock.id),
        ),
      )
      .limit(1);

    const currentQty = currentHolding?.quantity ?? 0;
    const currentHoldingValue = currentQty * stock.lastPrice;

    // Validate trade
    const validation = validateTrade({
      symbol,
      side,
      quantity: Number(quantity),
      currentPrice: stock.lastPrice,
      availableCash: portfolio.cash,
      currentHoldingQuantity: currentQty,
      portfolioTotalValue: portfolio.totalValue,
      currentHoldingValue,
    });

    if (!validation.valid) {
      // Record failed trade
      await db.insert(trades).values({
        agentId: agent.id,
        stockId: stock.id,
        symbol,
        side,
        quantity: Number(quantity),
        price: stock.lastPrice,
        totalAmount: 0,
        status: 'failed',
        reason: validation.reason,
      });

      return NextResponse.json(
        { error: validation.reason },
        { status: 400 },
      );
    }

    const tradeAmount = calculateTradeAmount(stock.lastPrice, Number(quantity));

    if (side === 'buy') {
      // Deduct cash
      const newCash = portfolio.cash - tradeAmount;

      // Update or create holding
      if (currentHolding) {
        const newAvg = calculateAvgBuyPrice(
          currentQty,
          currentHolding.avgBuyPrice,
          Number(quantity),
          stock.lastPrice,
        );
        const newQty = currentQty + Number(quantity);
        const newValue = newQty * stock.lastPrice;

        await db.update(holdings).set({
          quantity: newQty,
          avgBuyPrice: newAvg,
          currentPrice: stock.lastPrice,
          currentValue: newValue,
          pnl: (stock.lastPrice - newAvg) * newQty,
          pnlPercent: newAvg > 0 ? ((stock.lastPrice - newAvg) / newAvg) * 100 : 0,
          updatedAt: new Date(),
        }).where(eq(holdings.id, currentHolding.id));
      } else {
        await db.insert(holdings).values({
          portfolioId: portfolio.id,
          agentId: agent.id,
          stockId: stock.id,
          symbol,
          quantity: Number(quantity),
          avgBuyPrice: stock.lastPrice,
          currentPrice: stock.lastPrice,
          currentValue: Number(quantity) * stock.lastPrice,
          pnl: 0,
          pnlPercent: 0,
        });
      }

      // Update portfolio cash
      await db.update(portfolios).set({
        cash: newCash,
        totalValue: newCash + portfolio.totalValue - portfolio.cash, // keep holdings portion unchanged for now
        updatedAt: new Date(),
      }).where(eq(portfolios.id, portfolio.id));

    } else {
      // Sell
      const proceeds = stock.lastPrice * Number(quantity); // No slippage on sells for simplicity
      const newCash = portfolio.cash + proceeds;
      const newQty = currentQty - Number(quantity);

      if (newQty === 0) {
        // Remove holding entirely
        await db.delete(holdings).where(eq(holdings.id, currentHolding!.id));
      } else {
        const newValue = newQty * stock.lastPrice;
        await db.update(holdings).set({
          quantity: newQty,
          currentPrice: stock.lastPrice,
          currentValue: newValue,
          pnl: (stock.lastPrice - currentHolding!.avgBuyPrice) * newQty,
          pnlPercent: currentHolding!.avgBuyPrice > 0
            ? ((stock.lastPrice - currentHolding!.avgBuyPrice) / currentHolding!.avgBuyPrice) * 100
            : 0,
          updatedAt: new Date(),
        }).where(eq(holdings.id, currentHolding!.id));
      }

      await db.update(portfolios).set({
        cash: newCash,
        updatedAt: new Date(),
      }).where(eq(portfolios.id, portfolio.id));
    }

    // Record successful trade
    const [trade] = await db.insert(trades).values({
      agentId: agent.id,
      stockId: stock.id,
      symbol,
      side,
      quantity: Number(quantity),
      price: stock.lastPrice,
      totalAmount: tradeAmount,
      status: 'executed',
    }).returning({ id: trades.id });

    // Update agent trade count
    await db.update(agents).set({
      totalTrades: sql`${agents.totalTrades} + 1`,
      updatedAt: new Date(),
    }).where(eq(agents.id, agent.id));

    // Re-read updated portfolio
    const [updatedPortfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.agentId, agent.id))
      .limit(1);

    return NextResponse.json({
      tradeId: trade.id,
      symbol,
      side,
      quantity: Number(quantity),
      price: stock.lastPrice,
      totalAmount: tradeAmount,
      status: 'executed',
      portfolio: {
        cash: updatedPortfolio.cash,
        totalValue: updatedPortfolio.totalValue,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Trade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
