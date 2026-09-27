'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Globe, Check } from 'lucide-react';
import { LOCALES, type Locale } from '@/i18n/config';
import { setLocale } from '@/i18n/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export function LanguageSwitcher({ className, variant = 'compact' }: LanguageSwitcherProps) {
  const router = useRouter();
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  const handleSelect = (code: Locale) => {
    if (code === currentLocale) return;

    // Immediately set cookie in browser
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`;

    startTransition(async () => {
      await setLocale(code);
      window.location.reload();
    });
  };

  const current = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            className={cn('h-9 gap-1.5 px-2.5 text-xs font-medium', className)}
            title="Switch Language / மொழியை மாற்றவும்"
          >
            <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="hidden sm:inline font-semibold">{current.nativeName}</span>
            <span className="sm:hidden uppercase">{current.code}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-48 p-1">
        {LOCALES.map((item) => {
          const isSelected = item.code === currentLocale;
          return (
            <DropdownMenuItem
              key={item.code}
              onClick={() => handleSelect(item.code)}
              className={cn(
                'flex items-center justify-between cursor-pointer py-2 px-3 text-xs rounded-md',
                isSelected && 'bg-accent font-medium text-accent-foreground'
              )}
            >
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{item.nativeName}</span>
                <span className="text-[10px] text-muted-foreground">{item.name}</span>
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
