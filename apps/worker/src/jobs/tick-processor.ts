import {
  seasons,
  seasonPlayers,
  characters,
  opportunities,
  ledgerEntries,
  events,
  decisions,
} from '@blooper-arena/database/schema';
import { eq, sql, and, isNull, lte } from 'drizzle-orm';
import { processTick } from '@blooper-arena/game-engine';
import { createPlayerTickRNG } from '@blooper-arena/game-engine';

type Db = ReturnType<typeof import('@blooper-arena/database/client').createPooledDb>;

const BATCH_SIZE = 500;

export async function processTickBatch(db: Db): Promise<number> {
  // Find active season
  const activeSeason = await db
    .select()
    .from(seasons)
    .where(eq(seasons.status, 'active'))
    .limit(1);

  if (activeSeason.length === 0) return 0;

  const season = activeSeason[0];
  const tickInterval = season.tickIntervalMinutes || 30;

  // Find players due for a tick
  const duePlayers = await db
    .select()
    .from(seasonPlayers)
    .where(
      and(
        eq(seasonPlayers.seasonId, season.id),
        sql`(${seasonPlayers.lastTickAt} IS NULL OR ${seasonPlayers.lastTickAt} < NOW() - INTERVAL '${sql.raw(String(tickInterval))} minutes')`,
      ),
    )
    .orderBy(seasonPlayers.lastTickAt)
    .limit(BATCH_SIZE);

  let processedCount = 0;

  for (const player of duePlayers) {
    try {
      // Get character attributes
      const char = await db
        .select()
        .from(characters)
        .where(eq(characters.id, player.characterId))
        .limit(1);

      if (char.length === 0) continue;

      const attrs = char[0].attributes as {
        strategy: number;
        negotiation: number;
        riskAppetite: number;
        charisma: number;
        discipline: number;
        creativity: number;
      };

      // Count active opportunities and businesses
      const activeOpps = await db
        .select({ count: sql<number>`count(*)` })
        .from(opportunities)
        .where(
          and(
            eq(opportunities.seasonId, season.id),
            eq(opportunities.characterId, player.characterId),
            eq(opportunities.state, 'available'),
          ),
        );

      const rng = createPlayerTickRNG(season.seed, player.characterId, player.tickCount + 1);

      const tickResult = processTick({
        player: {
          id: player.id,
          characterId: player.characterId,
          seasonId: season.id,
          cash: player.cash,
          debt: player.debt,
          netWorth: player.netWorth,
          energy: player.energy,
          maxEnergy: player.maxEnergy,
          reputation: player.reputation,
          influence: player.influence,
          level: player.level,
          tickCount: player.tickCount,
          attributes: attrs,
          activeOpportunityCount: activeOpps[0]?.count ?? 0,
          activeBusinessCount: 0,
          businesses: [],
          cooldowns: new Map(),
        },
        rules: [], // Rules will be loaded from the game engine
        rng,
        now: new Date(),
      });

      // Persist all mutations
      // Insert new opportunities
      if (tickResult.newOpportunities.length > 0) {
        await db.insert(opportunities).values(
          tickResult.newOpportunities.map((opp) => ({
            id: opp.id,
            seasonId: opp.seasonId,
            characterId: opp.characterId,
            type: opp.type as any,
            importance: opp.importance,
            energyCost: opp.energyCost,
            payload: opp.payload,
            expiresAt: opp.expiresAt,
            state: 'available' as const,
          })),
        );

        // Create decisions for opportunities that need player input
        for (const opp of tickResult.newOpportunities) {
          await db.insert(decisions).values({
            id: crypto.randomUUID(),
            seasonId: season.id,
            characterId: player.characterId,
            opportunityId: opp.id,
            prompt: (opp.payload as any).description || `New ${opp.type} opportunity`,
            options: (opp.payload as any).choices || [
              { key: 'ACCEPT', label: 'Accept', energyCost: opp.energyCost },
              { key: 'REJECT', label: 'Decline', energyCost: 0 },
            ],
            status: 'pending',
            expiresAt: opp.expiresAt,
          });
        }
      }

      // Insert ledger entries
      if (tickResult.ledgerEntries.length > 0) {
        let runningBalance = player.cash;
        for (const entry of tickResult.ledgerEntries) {
          runningBalance += entry.amount;
          await db.insert(ledgerEntries).values({
            id: crypto.randomUUID(),
            seasonId: season.id,
            characterId: player.characterId,
            type: entry.type as any,
            amount: entry.amount,
            balanceAfter: runningBalance,
            description: entry.description,
            referenceId: entry.referenceId,
          });
        }
      }

      // Insert events
      if (tickResult.events.length > 0) {
        await db.insert(events).values(
          tickResult.events.map((evt) => ({
            id: crypto.randomUUID(),
            seasonId: season.id,
            actorId: player.characterId,
            eventType: evt.eventType,
            importance: evt.importance,
            canonicalPayload: { description: evt.description, ...evt.payload },
            isPublic: evt.isPublic,
          })),
        );
      }

      // Update player state
      await db
        .update(seasonPlayers)
        .set({
          cash: sql`${seasonPlayers.cash} + ${tickResult.cashDelta}`,
          energy: sql`LEAST(${seasonPlayers.maxEnergy}, ${seasonPlayers.energy} + ${tickResult.energyReplenished})`,
          reputation: sql`GREATEST(0, LEAST(100, ${seasonPlayers.reputation} + ${tickResult.reputationDelta}))`,
          influence: sql`${seasonPlayers.influence} + ${tickResult.influenceDelta}`,
          level: tickResult.newLevel,
          netWorth: sql`${seasonPlayers.cash} + ${tickResult.cashDelta}`,
          tickCount: sql`${seasonPlayers.tickCount} + 1`,
          lastTickAt: new Date(),
        })
        .where(eq(seasonPlayers.id, player.id));

      processedCount++;
    } catch (err) {
      console.error(`Failed to process tick for player ${player.id}:`, err);
    }
  }

  return processedCount;
}
