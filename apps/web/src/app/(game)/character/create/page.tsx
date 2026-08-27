'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AttributeAllocator,
  type AttributeValues,
} from '@/components/character/attribute-allocator';
import { CharacterCard } from '@/components/character/character-card';

const ATTRIBUTE_TOTAL = 100;

const defaultAttributes: AttributeValues = {
  strategy: 17,
  negotiation: 17,
  riskAppetite: 16,
  charisma: 17,
  discipline: 17,
  creativity: 16,
};

export default function CreateCharacterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [attributes, setAttributes] = useState<AttributeValues>(defaultAttributes);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalUsed = Object.values(attributes).reduce((sum, v) => sum + v, 0);
  const isValid =
    displayName.trim().length >= 2 &&
    displayName.trim().length <= 24 &&
    totalUsed === ATTRIBUTE_TOTAL;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim(), attributes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create character');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Your Character</h1>
        <p className="mt-2 text-muted-foreground">
          Allocate {ATTRIBUTE_TOTAL} attribute points to define your character's strengths. Choose
          wisely — your build determines how you compete.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-[1fr,300px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Identity</CardTitle>
                <CardDescription>Choose a name for your competitor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter a name (2-24 characters)"
                    maxLength={24}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attributes</CardTitle>
                <CardDescription>
                  Distribute {ATTRIBUTE_TOTAL} points across 6 attributes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AttributeAllocator values={attributes} onChange={setAttributes} />
              </CardContent>
            </Card>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" disabled={!isValid || isSubmitting} className="w-full">
              {isSubmitting ? 'Creating...' : 'Create Character'}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Preview</h3>
            <CharacterCard
              displayName={displayName || 'Your Character'}
              attributes={attributes}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
