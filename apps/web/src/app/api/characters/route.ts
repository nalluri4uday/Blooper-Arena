import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { characters } from '@blooper-arena/database/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

const ATTRIBUTE_TOTAL = 100;

export async function POST(request: NextRequest) {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { displayName, attributes } = body;

  // Validate display name
  if (
    !displayName ||
    typeof displayName !== 'string' ||
    displayName.trim().length < 2 ||
    displayName.trim().length > 24
  ) {
    return NextResponse.json(
      { error: 'Display name must be 2-24 characters' },
      { status: 400 },
    );
  }

  // Validate attributes
  if (!attributes || typeof attributes !== 'object') {
    return NextResponse.json({ error: 'Attributes are required' }, { status: 400 });
  }

  const requiredAttrs = ['strategy', 'negotiation', 'riskAppetite', 'charisma', 'discipline', 'creativity'];
  for (const attr of requiredAttrs) {
    const val = attributes[attr];
    if (typeof val !== 'number' || val < 0 || val > 100 || !Number.isInteger(val)) {
      return NextResponse.json(
        { error: `${attr} must be an integer between 0 and 100` },
        { status: 400 },
      );
    }
  }

  const total = requiredAttrs.reduce((sum, attr) => sum + attributes[attr], 0);
  if (total !== ATTRIBUTE_TOTAL) {
    return NextResponse.json(
      { error: `Attributes must sum to exactly ${ATTRIBUTE_TOTAL}, got ${total}` },
      { status: 400 },
    );
  }

  const db = getDb();
  const id = crypto.randomUUID();

  await db.insert(characters).values({
    id,
    userId: session.user.id,
    displayName: displayName.trim(),
    attributes: {
      strategy: attributes.strategy,
      negotiation: attributes.negotiation,
      riskAppetite: attributes.riskAppetite,
      charisma: attributes.charisma,
      discipline: attributes.discipline,
      creativity: attributes.creativity,
    },
  });

  return NextResponse.json({ id, displayName: displayName.trim() }, { status: 201 });
}

export async function GET() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const userCharacters = await db
    .select()
    .from(characters)
    .where(eq(characters.userId, session.user.id));

  return NextResponse.json({ characters: userCharacters });
}
