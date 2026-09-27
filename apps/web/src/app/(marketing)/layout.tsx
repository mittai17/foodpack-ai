import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { MarketingNav } from '@/components/layout/marketing-nav';

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const tm = await getTranslations('marketing.nav');
  const ts = await getTranslations('sidebar');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} {ts('brandName')}. Built for MoFPI — SIH 2026.</p>
          <div className="flex gap-4">
            <Link href="/features" className="hover:text-foreground">{tm('features')}</Link>
            <Link href="/how-it-works" className="hover:text-foreground">{tm('howItWorks')}</Link>
            <Link href="/about" className="hover:text-foreground">{tm('about')}</Link>
            <Link href="/learn" className="hover:text-foreground">{tm('learn')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

