'use client';

/**
 * /analysis/new — Module Selection Page
 *
 * The first step of every new packaging analysis is choosing the correct
 * product module.  Two large cards route the user to the appropriate
 * specialist wizard without any ambiguity.
 *
 * Design: same cream + green FoodPack AI language, existing sidebar/topbar.
 */

import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, Info, Leaf, Package } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getFoodName, getCategoryName } from '@/lib/i18n-helpers';

// ─── Fresh produce capabilities & examples ────────────────────────────────────

const FRESH_CAPABILITIES = [
  'Respiration & ripening analysis',
  'Ethylene sensitivity consideration',
  'O₂ / CO₂ requirements',
  'MAP (Modified Atmosphere Packaging)',
  'Breathable & micro-perforated packaging',
  'Temperature & chilling injury analysis',
  'Humidity management',
  'Fresh-produce shelf-life prediction',
];

const FRESH_EXAMPLES = [
  { emoji: '🍅', slug: 'tomato', name: 'Tomato' },
  { emoji: '🥭', slug: 'mango', name: 'Mango' },
  { emoji: '🍎', slug: 'apple', name: 'Apple' },
  { emoji: '🍌', slug: 'banana', name: 'Banana' },
  { emoji: '🍇', slug: 'grapes', name: 'Grapes' },
  { emoji: '🥕', slug: 'carrot', name: 'Carrot' },
  { emoji: '🥔', slug: 'potato', name: 'Potato' },
  { emoji: '🧅', slug: 'onion', name: 'Onion' },
  { emoji: '🥬', slug: 'leafy-veg', name: 'Leafy veg' },
  { emoji: '🫑', slug: 'capsicum', name: 'Capsicum' },
];

// ─── Other commodities categories & capabilities ───────────────────────────────

const OTHER_CATEGORIES = [
  { emoji: '🌾', slug: 'grains-cereals', name: 'Grains & Cereals' },
  { emoji: '🥛', slug: 'dairy', name: 'Dairy' },
  { emoji: '☕', slug: 'beverages', name: 'Beverages' },
  { emoji: '🥜', slug: 'nuts', name: 'Nuts & Seeds' },
  { emoji: '🫘', slug: 'pulses', name: 'Pulses' },
  { emoji: '🧂', slug: 'spices', name: 'Spices' },
  { emoji: '🍪', slug: 'bakery-snacks', name: 'Bakery & Snacks' },
  { emoji: '🍟', slug: 'processed-foods', name: 'Processed Foods' },
  { emoji: '🧊', slug: 'frozen-foods', name: 'Frozen Foods' },
];

const OTHER_CAPABILITIES = [
  'Moisture & humidity analysis',
  'pH & acidity evaluation',
  'Fat / oil oxidation analysis',
  'Microbial stability assessment',
  'Light & oxygen barrier requirements',
  'Mechanical protection for fragile products',
  'Sealability & hermetic requirements',
  'Aroma retention (coffee, spices)',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewAnalysisPage() {
  const t = useTranslations('newAnalysis');
  const locale = useLocale();

  const freshCapabilities = (t.raw('freshCapabilities') as string[]) || FRESH_CAPABILITIES;
  const otherCapabilities = (t.raw('otherCapabilities') as string[]) || OTHER_CAPABILITIES;

  const freshFeatureEmojis = [
    { emoji: '🍃', label: t('freshFeatureEmojis.fresh') },
    { emoji: '💨', label: t('freshFeatureEmojis.respiration') },
    { emoji: '🌡️', label: t('freshFeatureEmojis.ethylene') },
    { emoji: '🔬', label: t('freshFeatureEmojis.map') },
    { emoji: '❄️', label: t('freshFeatureEmojis.temp') },
    { emoji: '⏱️', label: t('freshFeatureEmojis.shelf') },
  ];

  const otherFeatureEmojis = [
    { emoji: '🌾', label: t('otherFeatureEmojis.grains') },
    { emoji: '🥛', label: t('otherFeatureEmojis.dairy') },
    { emoji: '🥩', label: t('otherFeatureEmojis.meat') },
    { emoji: '🍪', label: t('otherFeatureEmojis.bakery') },
    { emoji: '☕', label: t('otherFeatureEmojis.beverages') },
    { emoji: '❄️', label: t('otherFeatureEmojis.frozen') },
    { emoji: '🍟', label: t('otherFeatureEmojis.processed') },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t('backToDashboard')}
      </Link>

      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t('pageTitle')}</h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          {t('pageSubtitle')}
        </p>
      </div>

      {/* ── Two module cards ── */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* CARD 1 — Fresh Produce */}
        <ModuleCard
          href="/analysis/new/fresh-produce"
          accentColor="green"
          icon={<Leaf className="h-7 w-7" />}
          badge={t('freshProduceBadge')}
          title={t('freshProduceTitle')}
          description={t('freshProduceDesc')}
          capabilities={freshCapabilities}
          examples={FRESH_EXAMPLES}
          ctaLabel={t('startFreshAnalysis')}
          examplesLabel={t('freshProduceExamplesLabel')}
          locale={locale}
        />

        {/* CARD 2 — Other Commodities */}
        <ModuleCard
          href="/analysis/new/other-commodities"
          accentColor="blue"
          icon={<Package className="h-7 w-7" />}
          badge={t('otherCommoditiesBadge')}
          title={t('otherCommoditiesTitle')}
          description={t('otherCommoditiesDesc')}
          capabilities={otherCapabilities}
          examples={OTHER_CATEGORIES}
          ctaLabel={t('startOtherAnalysis')}
          examplesLabel={t('freshProduceExamplesLabel')}
          locale={locale}
        />
      </div>

      {/* ── Which module section ── */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">{t('quickHelp')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ModuleGuide
            accentColor="green"
            icon="🌿"
            title={t('freshProduceTitle')}
            featureEmojis={freshFeatureEmojis}
          />
          <ModuleGuide
            accentColor="blue"
            icon="📦"
            title={t('otherCommoditiesTitle')}
            featureEmojis={otherFeatureEmojis}
          />
        </div>
      </section>

      {/* ── Not sure tip ── */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-3.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="text-sm">
          <p className="font-medium text-foreground">{t('quickHelpTitle')}</p>
          <p className="mt-0.5 text-muted-foreground">
            {t('quickHelpFreshRule')} {t('quickHelpOtherRule')}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── ModuleCard component ─────────────────────────────────────────────────────

function ModuleCard({
  href,
  accentColor,
  icon,
  badge,
  title,
  description,
  capabilities,
  examples,
  ctaLabel,
  examplesLabel,
  locale = 'en',
}: {
  href: string;
  accentColor: 'green' | 'blue';
  icon: React.ReactNode;
  badge: string;
  title: string;
  description: string;
  capabilities: string[];
  examples: { emoji: string; slug?: string; name: string }[];
  ctaLabel: string;
  examplesLabel?: string;
  locale?: string;
}) {
  const colors =
    accentColor === 'green'
      ? {
          icon: 'bg-primary text-primary-foreground',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40',
          check: 'text-emerald-600 dark:text-emerald-400',
          cta: 'bg-primary text-primary-foreground hover:bg-primary/90',
          ring: 'hover:ring-2 hover:ring-primary/30',
          exampleBg: 'bg-emerald-50 dark:bg-emerald-950/20',
        }
      : {
          icon: 'bg-blue-600 text-white',
          badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/40',
          check: 'text-blue-600 dark:text-blue-400',
          cta: 'bg-blue-600 text-white hover:bg-blue-700',
          ring: 'hover:ring-2 hover:ring-blue-400/30',
          exampleBg: 'bg-blue-50 dark:bg-blue-950/20',
        };

  return (
    <div
      className={`flex flex-col rounded-2xl border border-border bg-card overflow-hidden transition-shadow ${colors.ring} shadow-sm hover:shadow-md`}
    >
      {/* Header with image area */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${colors.badge}`}>
              {badge}
            </span>
            <h3 className="mt-1.5 text-lg font-semibold tracking-tight leading-tight">{title}</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="px-6 pb-4">
        <ul className="space-y-1.5">
          {capabilities.map((cap) => (
            <li key={cap} className="flex items-start gap-2 text-xs text-foreground">
              <CheckCircle2 className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${colors.check}`} />
              {cap}
            </li>
          ))}
        </ul>
      </div>

      {/* Examples / categories */}
      <div className={`mx-6 mb-4 rounded-xl px-3 py-2.5 ${colors.exampleBg}`}>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {examplesLabel || 'Examples'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {examples.map((ex) => {
            const label = getFoodName({ slug: ex.slug, name: ex.name }, locale) || getCategoryName({ slug: ex.slug, name: ex.name }, locale);
            return (
              <span
                key={ex.name}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium"
              >
                {ex.emoji} {label}
              </span>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto px-6 pb-6">
        <Link
          href={href}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${colors.cta}`}
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── ModuleGuide component ────────────────────────────────────────────────────

function ModuleGuide({
  accentColor,
  icon,
  title,
  featureEmojis,
}: {
  accentColor: 'green' | 'blue';
  icon: string;
  title: string;
  featureEmojis: { emoji: string; label: string }[];
}) {
  const colors =
    accentColor === 'green'
      ? 'border-emerald-200/60 bg-emerald-50/60 dark:border-emerald-900/30 dark:bg-emerald-950/20'
      : 'border-blue-200/60 bg-blue-50/60 dark:border-blue-900/30 dark:bg-blue-950/20';

  return (
    <div className={`rounded-xl border px-4 py-4 ${colors}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <p className="text-sm font-semibold">{title}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {featureEmojis.map((f) => (
          <div
            key={f.label}
            className="flex flex-col items-center gap-1 rounded-lg border border-border/50 bg-card px-2.5 py-2 text-center"
          >
            <span className="text-lg">{f.emoji}</span>
            <p className="text-[10px] font-medium text-muted-foreground leading-tight w-16">
              {f.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
