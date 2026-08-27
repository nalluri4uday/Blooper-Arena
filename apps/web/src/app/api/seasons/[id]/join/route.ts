import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { seasons, seasonPlayers, characters, ledgerEntries } from '@blooper-arena/database/schema';
import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: seasonId } = await params;
  const body = await request.json();
  let { characterId } = body;

  const db = getDb();

  // If characterId is 'latest', find the user's most recent character
  if (characterId === 'latest') {
    const userChars = await db
      .select()
      .from(characters)
      .where(eq(characters.userId, session.user.id))
      .limit(1);

    if (userChars.length === 0) {
      return NextResponse.json(
        { error: 'Create a character first' },
        { status: 400 },
      );
    }
    characterId = userChars[0].id;
  }

  // Verify character belongs to user
  const char = await db
    .select()
    .from(characters)
    .where(and(eq(characters.id, characterId), eq(characters.userId, session.user.id)))
    .limit(1);

  if (char.length === 0) {
    return NextResponse.json({ error: 'Character not found' }, { status: 404 });
  }

  // Verify season exists and is joinable
  const season = await db
    .select()
    .from(seasons)
    .where(eq(seasons.id, seasonId))
    .limit(1);

  if (season.length === 0) {
    return NextResponse.json({ error: 'Season not found' }, { status: 404 });
  }

  if (season[0].status !== 'registration' && season[0].status !== 'active') {
    return NextResponse.json(
      { error: 'Season is not accepting new players' },
      { status: 400 },
    );
  }

  // Check if already joined
  const existing = await db
    .select()
    .from(seasonPlayers)
    .where(
      and(
        eq(seasonPlayers.seasonId, seasonId),
        eq(seasonPlayers.characterId, characterId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: 'Already joined this season' }, { status: 400 });
  }

  const startingCapital = season[0].startingCapital;

  // Create season player and initial ledger entry
  const [newPlayer] = await db.insert(seasonPlayers).values({
    seasonId,
    characterId,
    cash: startingCapital,
    netWorth: startingCapital,
    energyLastReplenishedAt: new Date(),
  }).returning({ id: seasonPlayers.id });

  await db.insert(ledgerEntries).values({
    seasonId,
    characterId,
    type: 'starting_capital',
    amount: startingCapital,
    balanceAfter: startingCapital,
    description: `Starting capital for season: ${season[0].name}`,
  });

  return NextResponse.json({ playerId: newPlayer.id, seasonId, characterId }, { status: 201 });
}
