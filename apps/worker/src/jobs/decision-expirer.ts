import { decisions } from '@blooper-arena/database/schema';
import { eq, sql, and, lte } from 'drizzle-orm';

type Db = ReturnType<typeof import('@blooper-arena/database/client').createPooledDb>;

export async function expireDecisions(db: Db): Promise<void> {
  // Mark expired pending decisions as 'expired'
  await db
    .update(decisions)
    .set({
      status: 'expired',
      selectedOption: 'AUTO_EXPIRED',
    })
    .where(
      and(
        eq(decisions.status, 'pending'),
        lte(decisions.expiresAt, new Date()),
      ),
    );
}
