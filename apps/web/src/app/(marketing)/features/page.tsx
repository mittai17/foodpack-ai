import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
  Beaker,
  Calculator,
  FlaskConical,
  Gauge,
  Recycle,
  ScrollText,
  Sparkles,
  Wind,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Features' };

export default async function FeaturesPage() {
  const t = await getTranslations('features');

  const FEATURES = [
    {
      icon: FlaskConical,
      title: t('f1Title'),
      description: t('f1Desc'),
      status: 'live' as const,
    },
    {
      icon: Wind,
      title: t('f2Title'),
      description: t('f2Desc'),
      status: 'live' as const,
    },
    {
      icon: Gauge,
      title: t('f3Title'),
      description: t('f3Desc'),
      status: 'live' as const,
    },
    {
      icon: Calculator,
      title: t('f4Title'),
      description: t('f4Desc'),
      status: 'live' as const,
    },
    {
      icon: Beaker,
      title: t('f5Title'),
      description: t('f5Desc'),
      status: 'live' as const,
    },
    {
      icon: Sparkles,
      title: t('f6Title'),
      description: t('f6Desc'),
      status: 'live' as const,
    },
    {
      icon: Recycle,
      title: t('f7Title'),
      description: t('f7Desc'),
      status: 'live' as const,
    },
    {
      icon: ScrollText,
      title: t('f8Title'),
      description: t('f8Desc'),
      status: 'roadmap' as const,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-6">
      <div className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">{t('pageTitle')}</h1>
        <p className="text-muted-foreground">{t('pageSubtitle')}</p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardContent className="space-y-2 px-6 py-6">
              <div className="flex items-center justify-between">
                <feature.icon className="h-5 w-5 text-primary" />
                <Badge variant={feature.status === 'live' ? 'secondary' : 'outline'}>
                  {feature.status === 'live' ? t('liveBadge') : t('roadmapBadge')}
                </Badge>
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

