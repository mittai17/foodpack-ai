'use client';

import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from './language-switcher';

export function MarketingNav() {
  const ts = useTranslations('sidebar');
  const tm = useTranslations('marketing.nav');

  const LINKS = [
    { label: tm('features'), href: '/features' },
    { label: tm('howItWorks'), href: '/how-it-works' },
    { label: tm('learn'), href: '/learn' },
    { label: tm('about'), href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">{ts('brandName')}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button nativeButton={false} render={<Link href="/dashboard">{tm('getStarted')}</Link>} />
        </div>
      </div>
    </header>
  );
}
