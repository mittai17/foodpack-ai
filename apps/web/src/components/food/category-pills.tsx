'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useFoodCategories } from '@/hooks/use-foods';
import { cn } from '@/lib/utils';
import { getCategoryName } from '@/lib/i18n-helpers';
import type { AnalysisModule } from '@/app/(app)/analysis/new/_wizard/module-wizard';

// Categories that belong to fresh produce
const FRESH_PRODUCE_CATEGORIES = new Set(['fruits', 'vegetables']);

export function CategoryPills({
  value,
  onChange,
  module,
}: {
  value: string | undefined;
  onChange: (category: string | undefined) => void;
  /** Optional — filters categories to only those belonging to the module */
  module?: AnalysisModule;
}) {
  const { data: categories } = useFoodCategories();
  const locale = useLocale();
  const tc = useTranslations('common');

  const filteredCategories = (categories ?? []).filter((c) => {
    if (!module) return true;
    const isFreshCategory = FRESH_PRODUCE_CATEGORIES.has(c.slug);
    return module === 'fresh_produce' ? isFreshCategory : !isFreshCategory;
  });

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
        {tc('all')}
      </button>
      {filteredCategories.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.slug)}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
            value === c.slug ? 'border-primary bg-accent text-accent-foreground' : 'border-border text-muted-foreground hover:bg-secondary/40',
          )}
        >
          {getCategoryName(c, locale)}
        </button>
      ))}
    </div>
  );
}
