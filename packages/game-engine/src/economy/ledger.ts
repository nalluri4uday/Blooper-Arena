import { LedgerOperation, LedgerEntry } from './types.js';

let ledgerCounter = 0;

/**
 * Generate a unique ledger entry ID.
 * Uses a monotonic counter combined with timestamp for uniqueness.
 * In production, the persistence layer would use UUIDs or database-generated IDs.
 */
function generateLedgerId(): string {
  ledgerCounter += 1;
  return `ledger_${Date.now()}_${ledgerCounter}`;
}

/**
 * Create a single ledger entry from an operation.
 * The balanceAfter is computed as currentBalance + amount.
 */
export function createLedgerEntry(op: LedgerOperation): LedgerEntry {
  return {
    id: generateLedgerId(),
    seasonId: op.seasonId,
    characterId: op.characterId,
    type: op.type,
    amount: op.amount,
    balanceAfter: op.currentBalance + op.amount,
    referenceId: op.referenceId,
    description: op.description,
  };
}

/**
 * Create multiple ledger entries from a list of operations.
 * Each operation is processed independently.
 */
export function createMultipleEntries(ops: LedgerOperation[]): LedgerEntry[] {
  return ops.map(createLedgerEntry);
}

/**
 * Reset the internal counter. Useful for testing determinism.
 */
export function resetLedgerCounter(): void {
  ledgerCounter = 0;
}
