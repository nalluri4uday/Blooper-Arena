'use client';

import Link from 'next/link';
import { Menu, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  energy?: number;
  maxEnergy?: number;
  onMenuToggle?: () => void;
}

export function Header({ energy, maxEnergy, onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-card px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuToggle}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1" />
      {energy !== undefined && maxEnergy !== undefined && (
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-energy" />
          <span className="font-medium">
            {energy}/{maxEnergy}
          </span>
        </div>
      )}
      <Link href="/character/create">
        <Button size="sm" variant="outline">
          New Character
        </Button>
      </Link>
    </header>
  );
}
