'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './nav-items';
import { HillsIllustration } from './hills-illustration';

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Leaf className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[15px] font-semibold leading-tight tracking-tight">FoodPack AI</p>
          <p className="text-[11px] leading-tight text-muted-foreground">
            Smarter Packaging, Healthier Food
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-6 overflow-hidden rounded-t-2xl">
        <div className="relative z-10 px-5 pb-4 pt-5">
          <p className="text-sm font-semibold text-sidebar-accent-foreground">
            Sustainable Packaging
          </p>
          <p className="text-xs text-muted-foreground">for a Better Tomorrow</p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <HillsIllustration />
        </div>
      </div>
    </div>
  );
}
