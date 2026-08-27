/**
 * Policy engine: handles auto-resolution of expired decisions.
 *
 * When a player doesn't respond to an opportunity before it expires,
 * the policy engine selects the default choice (typically the least
 * impactful option).
 */

/**
 * Get the default choice for an opportunity type when no player action
 * is taken. Defaults to REJECT/PASS for most opportunities, and to the
 * least costly option for risk events.
 */
export function getDefaultChoice(
  opportunityType: string,
  choices: string[],
): string {
  if (choices.length === 0) {
    return 'PASS';
  }

  // For risk events, default to the least risky/cheapest option
  // (typically ACCEPT the consequences rather than doing nothing)
  if (opportunityType === 'risk_event') {
    if (choices.includes('ACCEPT')) return 'ACCEPT';
    return choices[0]!;
  }

  // For market events, these are passive -- just acknowledge
  if (opportunityType === 'market_event') {
    if (choices.includes('ACKNOWLEDGE')) return 'ACKNOWLEDGE';
    if (choices.includes('ACCEPT')) return 'ACCEPT';
    return choices[0]!;
  }

  // For all other types, prefer REJECT/PASS (no commitment)
  if (choices.includes('REJECT')) return 'REJECT';
  if (choices.includes('PASS')) return 'PASS';
  if (choices.includes('DECLINE')) return 'DECLINE';

  // Fallback: first choice
  return choices[0]!;
}

/**
 * Check whether a given opportunity has expired.
 */
export function isExpired(expiresAt: Date, now: Date): boolean {
  return now.getTime() >= expiresAt.getTime();
}

/**
 * Get the time remaining before an opportunity expires, in milliseconds.
 * Returns 0 if already expired.
 */
export function timeToExpiry(expiresAt: Date, now: Date): number {
  return Math.max(0, expiresAt.getTime() - now.getTime());
}
