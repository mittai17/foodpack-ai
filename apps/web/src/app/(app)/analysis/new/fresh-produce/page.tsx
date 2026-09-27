import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { ModuleWizard } from '../_wizard/module-wizard';

export const metadata = { title: 'Fresh Produce Analysis' };

export default async function FreshProducePage() {
  const t = await getTranslations('freshProducePage');

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/analysis/new"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('chooseModule')}
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground text-base">
            🌿
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight leading-tight">
              {t('title')}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>
      <Suspense fallback={null}>
        <ModuleWizard module="fresh_produce" />
      </Suspense>
    </div>
  );
}
