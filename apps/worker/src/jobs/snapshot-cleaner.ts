import { marketSnapshots } from '@blooper-arena/database/schema';
import { lt } from 'drizzle-orm';

export async function runSnapshotCleaner(db: any) {
  console.log('[snapshot-cleaner] Cleaning old snapshots...');

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await db
      .delete(marketSnapshots)
      .where(lt(marketSnapshots.snapshotAt, thirtyDaysAgo));

    console.log('[snapshot-cleaner] Cleaned old market snapshots');
  } catch (error) {
    console.error('[snapshot-cleaner] Error:', error);
  }
}
