import { seasons, seasonPlayers } from '@blooper-arena/database/schema';
import { eq, sql, lt } from 'drizzle-orm';

type Db = ReturnType<typeof import('@blooper-arena/database/client').createPooledDb>;

const ENERGY_PER_HOUR = 10;

export async function replenishEnergy(db: Db): Promise<void> {
  // Find active season
  const activeSeason = await db
    .select()
    .from(seasons)
    .where(eq(seasons.status, 'active'))
    .limit(1);

  if (activeSeason.length === 0) return;

  // Calculate energy to add based on time since last replenishment
  // We replenish every 15 minutes, so add ~2.5 energy per call (round down)
  const energyToAdd = Math.floor(ENERGY_PER_HOUR / 4); // 2 energy per 15-min cycle

  // Update all players who have energy below max
  await db
    .update(seasonPlayers)
    .set({
      energy: sql`LEAST(${seasonPlayers.maxEnergy}, ${seasonPlayers.energy} + ${energyToAdd})`,
      energyLastReplenishedAt: new Date(),
    })
    .where(
      eq(seasonPlayers.seasonId, activeSeason[0].id),
    );
}
