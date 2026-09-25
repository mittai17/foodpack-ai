'use client';

import { useFoodCategories } from '@/hooks/use-foods';
import { cn } from '@/lib/utils';

export function CategoryPills({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (category: string | undefined) => void;
}) {
  const { data: categories } = useFoodCategories();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(undefined)}
        className={cn(
          'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
          !value ? 'border-primary bg-accent text-accent-foreground' : 'border-border text-muted-foreground hover:bg-secondary/40',
        )}
      >
        All
      </button>
      {(categories ?? []).map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.slug)}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
            value === c.slug ? 'border-primary bg-accent text-accent-foreground' : 'border-border text-muted-foreground hover:bg-secondary/40',
          )}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
