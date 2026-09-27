'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFoods } from '@/hooks/use-foods';
import { getFoodEmoji } from '@/lib/food-icons';
import { CategoryPills } from '@/components/food/category-pills';
import { getFoodName, getCategoryName } from '@/lib/i18n-helpers';

export default function FoodsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const t = useTranslations('foods');
  const locale = useLocale();

  const { data: foods, isLoading } = useFoods({ search, category });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('pageTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('pageSubtitle')}</p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="pl-9"
        />
      </div>

      <CategoryPills value={category} onChange={setCategory} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        {(foods?.items ?? []).map((food) => (
          <Link key={food.id} href={`/foods/${food.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="space-y-1 px-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg">
                  {getFoodEmoji(food.slug, food.category.slug)}
                </div>
                <p className="pt-1 text-sm font-semibold">{getFoodName(food, locale)}</p>
                <p className="text-xs text-muted-foreground">{getCategoryName(food.category, locale)}</p>
                {food.isFreshProduce && (
                  <Badge variant="secondary" className="mt-1">
                    {t('freshProduce')}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
