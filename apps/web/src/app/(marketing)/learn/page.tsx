import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Learn' };

export default async function LearnPage() {
  const t = await getTranslations('learn');

  const GLOSSARY = [
    {
      term: t('glossary.otr.term'),
      definition: t('glossary.otr.definition'),
    },
    {
      term: t('glossary.wvtr.term'),
      definition: t('glossary.wvtr.definition'),
    },
    {
      term: t('glossary.map.term'),
      definition: t('glossary.map.definition'),
    },
    {
      term: t('glossary.respiration.term'),
      definition: t('glossary.respiration.definition'),
    },
    {
      term: t('glossary.monoMaterial.term'),
      definition: t('glossary.monoMaterial.definition'),
    },
    {
      term: t('glossary.waterActivity.term'),
      definition: t('glossary.waterActivity.definition'),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6">
      <div className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">{t('pageTitle')}</h1>
        <p className="text-muted-foreground">{t('pageSubtitle')}</p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {GLOSSARY.map((item) => (
          <Card key={item.term}>
            <CardContent className="space-y-1.5 px-5 py-5">
              <h3 className="font-semibold">{item.term}</h3>
              <p className="text-sm text-muted-foreground">{item.definition}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

