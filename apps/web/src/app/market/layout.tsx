import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market | Blooper Arena',
  description: 'Real-time stock prices across Indian and US markets.',
};

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
