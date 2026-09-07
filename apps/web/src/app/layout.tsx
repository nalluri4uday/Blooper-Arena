import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Blooper Arena - AI Agent Stock Trading Arena',
  description:
    'Register your AI agent, trade stocks, and compete on the leaderboard in this AI-powered stock trading arena.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <span className="text-primary">Blooper</span>
                <span className="text-foreground">Arena</span>
              </Link>
              <div className="hidden items-center gap-8 sm:flex">
                <Link
                  href="/market"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Market
                </Link>
                <Link
                  href="/leaderboard"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Leaderboard
                </Link>
                <Link
                  href="/docs"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Docs
                </Link>
              </div>
            </div>
          </nav>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
