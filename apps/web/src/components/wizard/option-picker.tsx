'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

export function OptionPicker<T extends string>({
  options,
  value,
  onChange,
  columns = 3,
}: {
  options: Option<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4;
}) {
  const cols = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' }[columns];

  return (
    <div className={cn('grid grid-cols-1 gap-3', cols)}>
      {options.map((option) => {
        const Icon = option.icon;
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'group relative flex items-start justify-between gap-3 rounded-2xl border p-4 text-left transition-all',
              active
                ? 'border-emerald-600 bg-emerald-50/20 shadow-sm ring-1 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-950/20 dark:ring-emerald-500/30'
                : 'border-border/80 bg-card hover:border-slate-300 hover:bg-secondary/30 dark:hover:border-neutral-700',
            )}
          >
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              {Icon && (
                <Icon
                  className={cn(
                    'mt-0.5 h-5 w-5 shrink-0 transition-colors',
                    active ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-muted-foreground',
                  )}
                />
              )}
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground tracking-tight">{option.label}</span>
                {option.description && (
                  <span className="block text-xs text-muted-foreground mt-0.5 leading-relaxed">{option.description}</span>
                )}
              </div>
            </div>

            {/* Custom Radio Circle */}
            <div
              className={cn(
                'ml-2 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all',
                active
                  ? 'border-2 border-emerald-600 dark:border-emerald-500'
                  : 'border border-slate-300 group-hover:border-slate-400 dark:border-neutral-600 dark:group-hover:border-neutral-500',
              )}
            >
              {active && <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-in zoom-in-50 duration-150" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

