'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMaterials } from '@/hooks/use-materials';

export default function MaterialsPage() {
  const [search, setSearch] = useState('');
  const { data: materials, isLoading } = useMaterials({ search });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Packaging Materials</h1>
        <p className="text-sm text-muted-foreground">
          Barrier, mechanical, and sustainability properties for validated packaging materials.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search materials…"
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
                  <p className="text-sm font-semibold">{material.name}</p>
                  <Badge variant="outline">{material.materialType}</Badge>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">{material.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {material.recyclable && <Badge variant="secondary">Recyclable</Badge>}
                  {material.biodegradable && <Badge variant="secondary">Biodegradable</Badge>}
                  {material.monoMaterial && <Badge variant="secondary">Mono-material</Badge>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
