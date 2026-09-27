'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMaterials } from '@/hooks/use-materials';
import {
  getMaterialName,
  getMaterialDescription,
  getMaterialTypeName,
} from '@/lib/i18n-helpers';

export default function MaterialsPage() {
  const [search, setSearch] = useState('');
  const { data: materials, isLoading } = useMaterials({ search });
  const t = useTranslations('materials');
  const locale = useLocale();

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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        {(materials?.items ?? []).map((material) => (
          <Link key={material.id} href={`/materials/${material.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="space-y-2 px-4 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{getMaterialName(material, locale)}</p>
                  <Badge variant="outline">{getMaterialTypeName(material.materialType, locale)}</Badge>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {getMaterialDescription(material, locale)}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {material.recyclable && <Badge variant="secondary">{t('recyclable')}</Badge>}
                  {material.biodegradable && <Badge variant="secondary">{t('biodegradable')}</Badge>}
                  {material.monoMaterial && <Badge variant="secondary">{t('monoMaterial')}</Badge>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

