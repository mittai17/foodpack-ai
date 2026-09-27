import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BrandLogo } from '@/components/layout/brand-logo';

export const metadata: Metadata = { title: 'About NutriWrap' };

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-16 md:px-6">
      <div className="flex flex-col gap-4">
        <BrandLogo height={44} priority />
        <h1 className="text-3xl font-semibold tracking-tight">{t('pageTitle')}</h1>
      </div>
      <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
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
