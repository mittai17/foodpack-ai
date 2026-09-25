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
    <div className={cn('grid grid-cols-1 gap-2.5', cols)}>
      {options.map((option) => {
        const Icon = option.icon;
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
              active
                ? 'border-primary bg-accent text-accent-foreground ring-1 ring-primary'
                : 'border-border bg-card hover:bg-secondary/40',
            )}
          >
            {Icon && (
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} />
            )}
            <span>
              <span className="block text-sm font-medium">{option.label}</span>
              {option.description && (
                <span className="block text-xs text-muted-foreground">{option.description}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
