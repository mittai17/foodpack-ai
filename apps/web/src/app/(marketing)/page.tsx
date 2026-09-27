import Link from 'next/link';
import { ArrowRight, FlaskConical, Layers3, Leaf, Recycle, ShieldCheck, Sparkles } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getFoodName, getStorageLabel } from '@/lib/i18n-helpers';

const COMMODITIES = ['mango', 'tomato', 'banana', 'apple', 'rice', 'milk', 'coffee-roasted-ground', 'cashew'];

export default async function LandingPage() {
  const t = await getTranslations('marketing.home');
  const locale = await getLocale();

  const STEPS = [
    {
      title: t('step1Title'),
      description: t('step1Desc'),
      icon: Leaf,
    },
    {
      title: t('step2Title'),
      description: t('step2Desc'),
      icon: Sparkles,
    },
    {
      title: t('step3Title'),
      description: t('step3Desc'),
      icon: FlaskConical,
    },
  ];

  const VALUE_PROPS = [
    {
      title: t('explainableTitle'),
      description: t('explainableDesc'),
      icon: ShieldCheck,
    },
    {
      title: t('citedTitle'),
      description: t('citedDesc'),
      icon: Layers3,
    },
    {
      title: t('sustainableTitle'),
      description: t('sustainableDesc'),
      icon: Recycle,
    },
  ];

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 md:px-6 md:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              {t('badge')}
            </span>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              {t('title')}
            </h1>
            <p className="max-w-lg text-base text-muted-foreground md:text-lg">
              {t('subtitle')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={
                  <Link href="/analysis/new">
                    {t('startAnalysis')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/how-it-works">{t('seeHowItWorks')}</Link>}
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {COMMODITIES.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {getFoodName(c, locale)}
                </span>
              ))}
            </div>
          </div>

          <Card className="border-border/80 shadow-sm">
            <CardContent className="space-y-4 px-6 py-6">
              <p className="text-sm font-medium text-muted-foreground">Example recommendation</p>
              <div className="flex items-center justify-between rounded-xl bg-accent px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-accent-foreground">
                    PET / Metallized PET / LDPE — MAP Pouch
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recommended for {getFoodName('mango', locale)} · {getStorageLabel('CHILLED', locale)} · 21 days
                  </p>
                </div>
                <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                  90.4
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Spec label="OTR" value="1,000–8,000 cc/m²/day" />
                <Spec label="WVTR" value="5–30 g/m²/day" />
                <Spec label="Shelf life" value="14–28 days" />
                <Spec label="Est. cost" value="₹4–6 / pack" />
              </div>
              <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                This is a decision-support estimate — validate experimentally before commercial production.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y border-border/60 bg-secondary/30 py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <h2 className="text-center text-2xl font-semibold tracking-tight">{t('howItWorksTitle')}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <Card key={step.title}>
                <CardContent className="space-y-3 px-6 py-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {i + 1}
                    </div>
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="text-center text-2xl font-semibold tracking-tight">
          {t('whyFoodpackTitle')}
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {VALUE_PROPS.map((v) => (
            <div key={v.title} className="space-y-2">
              <v.icon className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t('ctaTitle')}
            </h2>
            <p className="max-w-md text-sm text-primary-foreground/85">
              {t('ctaSubtitle')}
            </p>
            <Button
              size="lg"
              nativeButton={false}
              className="bg-white text-primary hover:bg-white/90"
              render={
                <Link href="/analysis/new">
                  {t('ctaButton')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

