import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import {
  decisions,
  seasonPlayers,
  characters,
  ledgerEntries,
  events,
} from '@blooper-arena/database/schema';
import { eq, and, sql } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: decisionId } = await params;
  const body = await request.json();
  const { selectedOption } = body;

  if (!selectedOption || typeof selectedOption !== 'string') {
    return NextResponse.json({ error: 'selectedOption is required' }, { status: 400 });
  }

  const db = getDb();

  // Fetch the decision
  const decision = await db
    .select()
    .from(decisions)
    .where(and(eq(decisions.id, decisionId), eq(decisions.status, 'pending')))
    .limit(1);

  if (decision.length === 0) {
    return NextResponse.json(
      { error: 'Decision not found or already resolved' },
      { status: 404 },
    );
  }

  const d = decision[0];

  // Verify ownership
  const char = await db
    .select()
    .from(characters)
    .where(and(eq(characters.id, d.characterId), eq(characters.userId, session.user.id)))
    .limit(1);

  if (char.length === 0) {
    return NextResponse.json({ error: 'Not your decision' }, { status: 403 });
  }

  // Validate the selected option
  const options = d.options as Array<{ key: string; label: string; energyCost?: number }>;
  const chosen = options.find((o) => o.key === selectedOption);
  if (!chosen) {
    return NextResponse.json({ error: 'Invalid option' }, { status: 400 });
  }

  // Check expiry
  if (new Date(d.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Decision has expired' }, { status: 400 });
  }

  // Get player state
  const player = await db
    .select()
    .from(seasonPlayers)
    .where(
      and(
        eq(seasonPlayers.seasonId, d.seasonId),
        eq(seasonPlayers.characterId, d.characterId),
      ),
    )
    .limit(1);

  if (player.length === 0) {
    return NextResponse.json({ error: 'Player not found in season' }, { status: 404 });
  }

  const energyCost = chosen.energyCost ?? 3;
  if (player[0].energy < energyCost) {
    return NextResponse.json(
      { error: `Insufficient energy. Need ${energyCost}, have ${player[0].energy}` },
      { status: 400 },
    );
  }

  // Mark decision as submitted and deduct energy
  await db
    .update(decisions)
    .set({
      selectedOption,
      status: 'submitted',
      submittedAt: new Date(),
    })
    .where(eq(decisions.id, decisionId));

  await db
    .update(seasonPlayers)
    .set({
      energy: sql`energy - ${energyCost}`,
    })
    .where(eq(seasonPlayers.id, player[0].id));

  // Create an event for this decision
  await db.insert(events).values({
    id: crypto.randomUUID(),
    seasonId: d.seasonId,
    actorId: d.characterId,
    eventType: 'decision_submitted',
    importance: 50,
    canonicalPayload: {
      decisionId,
      selectedOption,
      prompt: d.prompt,
      description: `You chose: ${chosen.label}`,
    },
    isPublic: false,
  });

  return NextResponse.json({
    success: true,
    decision: { id: decisionId, selectedOption, energySpent: energyCost },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: decisionId } = await params;
  const db = getDb();

  const decision = await db
    .select()
    .from(decisions)
    .where(eq(decisions.id, decisionId))
    .limit(1);

  if (decision.length === 0) {
    return NextResponse.json({ error: 'Decision not found' }, { status: 404 });
  }

  // Verify ownership
  const char = await db
    .select()
    .from(characters)
    .where(
      and(
        eq(characters.id, decision[0].characterId),
        eq(characters.userId, session.user.id),
      ),
    )
    .limit(1);

  if (char.length === 0) {
    return NextResponse.json({ error: 'Not your decision' }, { status: 403 });
  }

  return NextResponse.json({ decision: decision[0] });
}
