import type { MarketStatus } from './types';

// Indian public holidays 2024-2026 (NSE)
const INDIAN_HOLIDAYS = new Set([
  '2026-01-26', '2026-03-10', '2026-03-17', '2026-03-30', '2026-03-31',
  '2026-04-02', '2026-04-14', '2026-05-01', '2026-06-26', '2026-07-07',
  '2026-08-15', '2026-08-26', '2026-10-02', '2026-10-20', '2026-10-21',
  '2026-11-04', '2026-11-09', '2026-12-25',
]);

// US public holidays 2026 (NYSE)
const US_HOLIDAYS = new Set([
  '2026-01-01', '2026-01-19', '2026-02-16', '2026-04-03',
  '2026-05-25', '2026-06-19', '2026-07-03', '2026-09-07',
  '2026-11-26', '2026-12-25',
]);

function getDateInTimezone(tz: string): { dayOfWeek: number; hours: number; minutes: number; dateStr: string } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
    weekday: 'short',
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';

  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    dayOfWeek: dayMap[get('weekday')] ?? 0,
    hours: parseInt(get('hour')),
    minutes: parseInt(get('minute')),
    dateStr: `${get('year')}-${get('month')}-${get('day')}`,
  };
}

export function isIndianMarketOpen(): boolean {
  const { dayOfWeek, hours, minutes, dateStr } = getDateInTimezone('Asia/Kolkata');
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  if (INDIAN_HOLIDAYS.has(dateStr)) return false;
  const time = hours * 60 + minutes;
  return time >= 9 * 60 + 15 && time <= 15 * 60 + 30; // 9:15 - 15:30
}

export function isUSMarketOpen(): boolean {
  const { dayOfWeek, hours, minutes, dateStr } = getDateInTimezone('America/New_York');
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  if (US_HOLIDAYS.has(dateStr)) return false;
  const time = hours * 60 + minutes;
  return time >= 9 * 60 + 30 && time <= 16 * 60; // 9:30 - 16:00
}

export function isAnyMarketOpen(): boolean {
  return isIndianMarketOpen() || isUSMarketOpen();
}

export function getMarketStatus(): MarketStatus {
  return {
    india: isIndianMarketOpen() ? 'open' : 'closed',
    us: isUSMarketOpen() ? 'open' : 'closed',
  };
}
