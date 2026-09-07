import { describe, it, expect } from 'vitest';
import { getMarketStatus } from '../market-hours';

describe('getMarketStatus', () => {
  it('should return status object', () => {
    const status = getMarketStatus();
    expect(status).toHaveProperty('india');
    expect(status).toHaveProperty('us');
    expect(['open', 'closed', 'pre-market']).toContain(status.india);
    expect(['open', 'closed', 'pre-market']).toContain(status.us);
  });
});
