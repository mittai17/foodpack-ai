'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const PackagingViewer3D = dynamic(
  () => import('./packaging-viewer').then((mod) => mod.PackagingViewer),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full rounded-xl" />,
  },
);
