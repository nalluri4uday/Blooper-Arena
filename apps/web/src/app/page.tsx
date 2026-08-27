import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="mb-2 text-6xl font-bold tracking-tight">
          <span className="text-primary">Blooper</span> Arena
        </h1>
        <p className="mb-8 text-xl text-muted-foreground">
          Create your character. Enter the competition. Outsmart everyone.
        </p>
        <p className="mb-12 text-muted-foreground">
          AI Millionaire: Start with virtual capital, make strategic decisions, and race to the top
          of the leaderboard in a 30-day season.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Start Playing
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-lg border border-border px-8 py-3 text-lg font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
