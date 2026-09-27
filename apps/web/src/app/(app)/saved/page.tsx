import { Bookmark } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { ComingSoon } from '@/components/layout/coming-soon';

export const metadata = { title: 'Saved' };

export default async function SavedPage() {
  const t = await getTranslations('saved');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('pageTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('pageSubtitle')}</p>
      </div>
      <ComingSoon
        icon={Bookmark}
        title={t('roadmapTitle')}
        description={t('roadmapDesc')}
      />
    </div>
  );
}

