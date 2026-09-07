export function trackEvent(name: string, props?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    console.log(`[analytics] ${name}`, props);
  }
}
