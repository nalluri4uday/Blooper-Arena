'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-border bg-card px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuToggle}>
        <Menu className="h-5 w-5" />
      </Button>
      <Link href="/" className="text-lg font-semibold">
        <span className="text-primary">Blooper</span> Arena
      </Link>
      <div className="flex-1" />
    </header>
  );
}
