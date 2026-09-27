import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const metadata: Metadata = { title: 'About' };

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-16 md:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{t('pageTitle')}</h1>
      <div className="space-y-4 text-muted-foreground">
        <p>
          {t('statement', { psNumber: '26236', psTitle: t('psTitle') })}
        </p>
        <p>{t('improperPackaging')}</p>
        <p>{t('translationsExplanation')}</p>
        <p>{t('decisionSupportNotice')}</p>
      </div>
    </div>
  );
}

