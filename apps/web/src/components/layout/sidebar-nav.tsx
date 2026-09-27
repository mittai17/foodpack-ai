'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from './brand-logo';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './nav-items';
import { HillsIllustration } from './hills-illustration';

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useTranslations('navigation');
  const ts = useTranslations('sidebar');

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-5">
        <Link href="/dashboard" onClick={onNavigate} className="group flex flex-col gap-1.5 focus:outline-none">
          <BrandLogo height={34} priority />
          <p className="text-[11px] font-medium leading-tight text-muted-foreground tracking-tight">
            {ts('tagline')}
          </p>
        </Link>
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
              {t(item.translationKey)}
            </Link>
          );
        })}
      </nav>

      <div className="relative mt-6 overflow-hidden rounded-t-2xl">
        <div className="relative z-10 px-5 pb-4 pt-5">
          <p className="text-sm font-semibold text-sidebar-accent-foreground">
            {ts('sustainablePackaging')}
          </p>
          <p className="text-xs text-muted-foreground">{ts('betterTomorrow')}</p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <HillsIllustration />
        </div>
      </div>
    </div>
  );
}
