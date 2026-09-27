'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { LOCALES, type Locale } from '@/i18n/config';
import { setLocale } from '@/i18n/actions';
import {
  Sun, Moon, Monitor,
  User, BarChart3, Ruler, Database, Bell, Shield,
  Thermometer, Weight, MapPin, Gauge, FlaskConical, Zap,
  Package, Snowflake, Truck, Calendar, Target,
  ChevronRight, Lock, Fingerprint, Layers, FileText, Trash2,
  CheckCircle2, FolderOpen, Plus, AlertTriangle, TrendingUp, Newspaper,
  Eye, EyeOff, X, Save, Globe,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'general' | 'account' | 'analysis' | 'units' | 'sources' | 'notifications' | 'security';

interface SettingsState {
  fontSize: string;
  accentColor: string;
  temperature: string;
  weight: string;
  distance: string;
  pressure: string;
  gasConcentration: string;
  energy: string;
  defaultModule: string;
  defaultStorage: string;
  defaultTransport: string;
  defaultShelfLife: string;
  analysisObjective: string;
  dataSources: Record<string, boolean>;
  notifications: Record<string, boolean>;
}

type DialogType = 'password' | '2fa' | 'sessions' | 'privacy' | 'delete' | null;

// ─── Constants ─────────────────────────────────────────────────────────────────

const TABS: { id: TabId; icon: React.FC<{ className?: string }> }[] = [
  { id: 'general',       icon: User },
  { id: 'account',       icon: User },
  { id: 'analysis',      icon: BarChart3 },
  { id: 'units',         icon: Ruler },
  { id: 'sources',       icon: Database },
  { id: 'notifications', icon: Bell },
  { id: 'security',      icon: Shield },
];

const ACCENT_COLORS = [
  { id: 'green',  bg: 'bg-green-600',  ring: 'ring-green-600',  label: 'Green' },
  { id: 'blue',   bg: 'bg-blue-600',   ring: 'ring-blue-600',   label: 'Blue' },
  { id: 'purple', bg: 'bg-purple-600', ring: 'ring-purple-600', label: 'Purple' },
  { id: 'amber',  bg: 'bg-amber-500',  ring: 'ring-amber-500',  label: 'Amber' },
  { id: 'red',    bg: 'bg-red-600',    ring: 'ring-red-600',    label: 'Red' },
];

const DATA_SOURCES = [
  { id: 'uc-davis',  abbr: 'UC',   color: 'bg-red-600',   name: 'UC Davis Postharvest',          desc: 'Storage recommendations, respiration, ethylene' },
  { id: 'usda-food', abbr: 'USDA', color: 'bg-blue-700',  name: 'USDA FoodData Central',          desc: 'Nutritional and composition data' },
  { id: 'fao',       abbr: 'FAO',  color: 'bg-blue-500',  name: 'FAO Food Loss & Waste',          desc: 'Food loss and spoilage information' },
  { id: 'usda-ams',  abbr: 'USDA', color: 'bg-blue-700',  name: 'USDA AMS Standards',             desc: 'Quality, maturity and grading standards' },
  { id: 'pubmed',    abbr: 'Pub',  color: 'bg-sky-500',   name: 'Scientific Literature (PubMed)', desc: 'Research papers and technical data' },
];

const MOCK_SESSIONS = [
  { id: 1, device: 'Chrome on macOS',  location: 'Mumbai, IN',   time: 'Active now',    current: true },
  { id: 2, device: 'Firefox on Linux', location: 'Chennai, IN',  time: '2 hours ago',  current: false },
  { id: 3, device: 'Mobile Safari',    location: 'Bangalore, IN', time: '1 day ago',   current: false },
];

const DEFAULT: SettingsState = {
  fontSize: 'medium',
  accentColor: 'green',
  temperature: 'celsius',
  weight: 'kg',
  distance: 'km',
  pressure: 'kpa',
  gasConcentration: 'percentage',
  energy: 'kcal',
  defaultModule: 'ask',
  defaultStorage: 'refrigerated',
  defaultTransport: 'local',
  defaultShelfLife: '1-2weeks',
  analysisObjective: 'balanced',
  dataSources: { 'uc-davis': true, 'usda-food': true, fao: true, 'usda-ams': true, pubmed: true },
  notifications: { analysisComplete: true, projectUpdates: true, newData: true, systemAnnouncements: true, weeklyInsights: false, monthlyDigest: false },
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tc = useTranslations('common');
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const [isPendingLocale, startLocaleTransition] = useTransition();

  const [tab, setTab] = useState<TabId>('general');
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<SettingsState>(DEFAULT);
  const [dialog, setDialog] = useState<DialogType>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (code: Locale) => {
    if (code === currentLocale) return;
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`;
    startLocaleTransition(async () => {
      await setLocale(code);
      window.location.reload();
    });
  };

  const tabLabels: Record<TabId, string> = {
    general: t('tabs.general'),
    account: t('tabs.account'),
    analysis: t('tabs.analysis'),
    units: t('tabs.units'),
    sources: t('tabs.sources'),
    notifications: t('tabs.notifications'),
    security: t('tabs.security'),
  };

  // Profile state
  const [profile, setProfile] = useState({ name: 'John Doe', email: 'john@example.com', org: '', role: '' });
  const [profileDirty, setProfileDirty] = useState(false);

  const set = useCallback((key: keyof SettingsState, value: string | null) => {
    setSettings(prev => ({ ...prev, [key]: value ?? '' }));
  }, []);

  const toggleSource = (id: string) =>
    setSettings(p => ({ ...p, dataSources: { ...p.dataSources, [id]: !p.dataSources[id] } }));

  const toggleNotif = (id: string) =>
    setSettings(p => ({ ...p, notifications: { ...p.notifications, [id]: !p.notifications[id] } }));

  const saveToast = (section: string) => toast.success(`${section} saved`, { description: 'Your preferences have been updated.' });

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex flex-wrap gap-0 border-b border-border">
        {TABS.map(tabItem => {
          const Icon = tabItem.icon;
          const active = tab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {tabLabels[tabItem.id]}
            </button>
          );
        })}
      </div>

      {/* ══════════════════ GENERAL TAB ══════════════════ */}
      {tab === 'general' && (
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Language Selection */}
          <Card className="lg:col-span-3 border-primary/20 bg-accent/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle>{t('language.title')}</CardTitle>
              </div>
              <CardDescription>{t('language.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">{t('language.label')}</p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6">
                {LOCALES.map((item) => {
                  const isSelected = item.code === currentLocale;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      disabled={isPendingLocale}
                      onClick={() => handleLanguageChange(item.code)}
                      className={cn(
                        'flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all',
                        isSelected
                          ? 'border-primary bg-background shadow-xs font-semibold text-primary'
                          : 'border-border/70 bg-card/60 text-foreground hover:border-primary/40 hover:bg-card'
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-sm font-semibold">{item.nativeName}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('appearance.title')}</CardTitle>
              <CardDescription>{t('appearance.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Theme */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">{t('appearance.theme')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'light', label: t('appearance.themeLight'), Icon: Sun },
                    { id: 'dark',  label: t('appearance.themeDark'),  Icon: Moon },
                    { id: 'system', label: t('appearance.themeSystem'), Icon: Monitor },
                  ] as const).map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => { setTheme(id); toast.success(t('appearance.themeToast', { theme: label })); }}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-medium transition-all',
                        mounted && theme === id
                          ? 'border-primary bg-accent text-primary'
                          : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">{t('appearance.accentColor')}</p>
                <div className="flex items-center gap-2.5">
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c.id}
                      title={c.label}
                      onClick={() => { set('accentColor', c.id); toast.success(t('appearance.accentToast', { color: c.label })); }}
                      className={cn(
                        'h-7 w-7 rounded-full flex items-center justify-center transition-all hover:scale-110',
                        c.bg,
                        settings.accentColor === c.id && `ring-2 ring-offset-2 ${c.ring}`,
                      )}
                    >
                      {settings.accentColor === c.id && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div className="flex items-center justify-between">
                <p className="text-sm">{t('appearance.fontSize')}</p>
                <Select value={settings.fontSize} onValueChange={v => { set('fontSize', v); toast.success(t('appearance.fontToast', { size: v ?? '' })); }}>
                  <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">{t('appearance.fontSmall')}</SelectItem>
                    <SelectItem value="medium">{t('appearance.fontMedium')}</SelectItem>
                    <SelectItem value="large">{t('appearance.fontLarge')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Units & Measurement */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('units.title')}</CardTitle>
              <CardDescription>{t('units.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <URow icon={<Thermometer className="h-4 w-4 text-orange-500" />} label={t('units.temperature')}      value={settings.temperature}       onChange={v => set('temperature', v)}
                opts={[['celsius','Celsius (°C)'],['fahrenheit','Fahrenheit (°F)'],['kelvin','Kelvin (K)']]} />
              <URow icon={<Weight       className="h-4 w-4 text-blue-500"   />} label={t('units.weight')}           value={settings.weight}            onChange={v => set('weight', v)}
                opts={[['kg','Kilogram (kg)'],['g','Gram (g)'],['lb','Pound (lb)']]} />
              <URow icon={<MapPin       className="h-4 w-4 text-green-600"  />} label={t('units.distance')}         value={settings.distance}          onChange={v => set('distance', v)}
                opts={[['km','Kilometer (km)'],['mi','Mile (mi)']]} />
              <URow icon={<Gauge        className="h-4 w-4 text-purple-500" />} label={t('units.pressure')}         value={settings.pressure}          onChange={v => set('pressure', v)}
                opts={[['kpa','kPa'],['atm','atm'],['bar','bar'],['psi','psi']]} />
              <URow icon={<FlaskConical className="h-4 w-4 text-cyan-500"   />} label={t('units.gasConcentration')} value={settings.gasConcentration} onChange={v => set('gasConcentration', v)}
                opts={[['percentage','Percentage (%)'],['ppm','ppm']]} />
            </CardContent>
          </Card>

          {/* Analysis Preferences */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('analysisPrefs.title')}</CardTitle>
              <CardDescription>{t('analysisPrefs.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <URow icon={<Package   className="h-4 w-4 text-amber-600" />} label={t('analysisPrefs.defaultModule')}           value={settings.defaultModule}   onChange={v => set('defaultModule', v)}
                opts={[['ask','Ask every time'],['fresh','Fresh Produce'],['dairy','Dairy'],['grains','Grains & Pulses'],['meat','Meat & Seafood']]} />
              <URow icon={<Snowflake className="h-4 w-4 text-blue-400"  />} label={t('analysisPrefs.defaultStorage')} value={settings.defaultStorage}  onChange={v => set('defaultStorage', v)}
                opts={[['ambient','Ambient'],['refrigerated','Refrigerated'],['frozen','Frozen']]} />
              <URow icon={<Truck     className="h-4 w-4 text-slate-500"  />} label={t('analysisPrefs.defaultTransport')} value={settings.defaultTransport} onChange={v => set('defaultTransport', v)}
                opts={[['local','Local'],['long_distance','Long Distance'],['export','Export']]} />
              <URow icon={<Calendar  className="h-4 w-4 text-rose-500"   />} label={t('analysisPrefs.defaultShelfLife')} value={settings.defaultShelfLife} onChange={v => set('defaultShelfLife', v)}
                opts={[['1-2weeks','1 – 2 weeks'],['1month','1 month'],['3months','3 months'],['6months','6 months'],['1year','1 year']]} />
              <URow icon={<Target    className="h-4 w-4 text-primary"     />} label={t('analysisPrefs.analysisObjective')}      value={settings.analysisObjective} onChange={v => set('analysisObjective', v)}
                opts={[['balanced','Balanced (Recommended)'],['max_shelf_life','Max Shelf Life'],['min_cost','Lowest Cost'],['sustainability','Sustainability']]} />
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('dataSources.title')}</CardTitle>
              <CardDescription>{t('dataSources.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {DATA_SOURCES.map(ds => (
                <div key={ds.id} className="flex items-center gap-3">
                  <div className={cn('flex h-8 w-10 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white', ds.color)}>{ds.abbr}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight truncate">{ds.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{ds.desc}</p>
                  </div>
                  <Switch checked={settings.dataSources[ds.id]} onCheckedChange={() => toggleSource(ds.id)} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('notifications.title')}</CardTitle>
              <CardDescription>{t('notifications.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NRow icon={<CheckCircle2 className="h-4 w-4 text-primary"      />} label={t('notifications.analysisComplete')}   desc={t('notifications.analysisCompleteDesc')}    checked={settings.notifications.analysisComplete}    onChange={() => toggleNotif('analysisComplete')} />
              <NRow icon={<FolderOpen   className="h-4 w-4 text-amber-600"    />} label={t('notifications.projectUpdates')}       desc={t('notifications.projectUpdatesDesc')}          checked={settings.notifications.projectUpdates}      onChange={() => toggleNotif('projectUpdates')} />
              <NRow icon={<Plus         className="h-4 w-4 text-green-600"    />} label={t('notifications.newData')}      desc={t('notifications.newDataDesc')}      checked={settings.notifications.newData}             onChange={() => toggleNotif('newData')} />
              <NRow icon={<AlertTriangle className="h-4 w-4 text-blue-500"   />} label={t('notifications.systemAnnouncements')}  desc={t('notifications.systemAnnouncementsDesc')}          checked={settings.notifications.systemAnnouncements} onChange={() => toggleNotif('systemAnnouncements')} />
              <NRow icon={<TrendingUp   className="h-4 w-4 text-purple-500"   />} label={t('notifications.weeklyInsights')}       desc={t('notifications.weeklyInsightsDesc')}         checked={settings.notifications.weeklyInsights}      onChange={() => toggleNotif('weeklyInsights')} />
            </CardContent>
          </Card>

          {/* Security & Privacy */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('security.title')}</CardTitle>
              <CardDescription>{t('security.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0.5">
              <SRow icon={<Lock        className="h-4 w-4 text-muted-foreground" />} label={t('security.changePassword')}          desc={t('security.changePasswordDesc')}        onClick={() => setDialog('password')} />
              <SRow icon={<Fingerprint className="h-4 w-4 text-muted-foreground" />} label={t('security.twoFactor')} desc={t('security.twoFactorDesc')}     onClick={() => setDialog('2fa')} />
              <SRow icon={<Layers      className="h-4 w-4 text-muted-foreground" />} label={t('security.manageSessions')}           desc={t('security.manageSessionsDesc')}    onClick={() => setDialog('sessions')} />
              <SRow icon={<FileText    className="h-4 w-4 text-muted-foreground" />} label={t('security.dataPrivacy')}              desc={t('security.dataPrivacyDesc')} onClick={() => setDialog('privacy')} />
              <SRow icon={<Trash2      className="h-4 w-4 text-destructive"      />} label={t('security.deleteAccount')}            desc={t('security.deleteAccountDesc')}    onClick={() => setDialog('delete')} destructive />
            </CardContent>
          </Card>

        </div>
      )}

      {/* ══════════════════ ACCOUNT TAB ══════════════════ */}
      {tab === 'account' && (
        <div className="max-w-2xl space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('account.profileTitle')}</CardTitle>
              <CardDescription>{t('account.profileSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={t('account.fullName')}>
                  <input className={inputCls} value={profile.name} onChange={e => { setProfile(p => ({ ...p, name: e.target.value })); setProfileDirty(true); }} placeholder={t('account.fullNamePlaceholder')} />
                </FormField>
                <FormField label={t('account.email')}>
                  <input className={inputCls} value={profile.email} type="email" onChange={e => { setProfile(p => ({ ...p, email: e.target.value })); setProfileDirty(true); }} placeholder={t('account.emailPlaceholder')} />
                </FormField>
                <FormField label={t('account.organization')}>
                  <input className={inputCls} value={profile.org} onChange={e => { setProfile(p => ({ ...p, org: e.target.value })); setProfileDirty(true); }} placeholder={t('account.organizationPlaceholder')} />
                </FormField>
                <FormField label={t('account.role')}>
                  <input className={inputCls} value={profile.role} onChange={e => { setProfile(p => ({ ...p, role: e.target.value })); setProfileDirty(true); }} placeholder={t('account.rolePlaceholder')} />
                </FormField>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <Button size="sm" onClick={() => { setProfileDirty(false); toast.success(t('account.profileSaved')); }}>
                  <Save className="h-3.5 w-3.5 mr-1.5" /> {t('account.saveChanges')}
                </Button>
                {profileDirty && <span className="text-xs text-muted-foreground">{tc('unsavedChanges')}</span>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('account.dangerZone')}</CardTitle>
              <CardDescription>{t('account.dangerZoneDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" size="sm" onClick={() => setDialog('delete')}>
                <Trash2 className="h-4 w-4 mr-1.5" /> {t('security.deleteAccount')}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════ ANALYSIS TAB ══════════════════ */}
      {tab === 'analysis' && (
        <div className="max-w-2xl space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('analysisPrefs.title')}</CardTitle>
              <CardDescription>{t('analysisPrefs.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <URow icon={<Package   className="h-4 w-4 text-amber-600" />} label={t('analysisPrefs.defaultModule')}           value={settings.defaultModule}    onChange={v => set('defaultModule', v)}
                opts={[['ask','Ask every time'],['fresh','Fresh Produce'],['dairy','Dairy'],['grains','Grains & Pulses'],['meat','Meat & Seafood']]} />
              <URow icon={<Snowflake className="h-4 w-4 text-blue-400"  />} label={t('analysisPrefs.defaultStorage')}     value={settings.defaultStorage}   onChange={v => set('defaultStorage', v)}
                opts={[['ambient','Ambient'],['refrigerated','Refrigerated'],['frozen','Frozen']]} />
              <URow icon={<Truck     className="h-4 w-4 text-slate-500"  />} label={t('analysisPrefs.defaultTransport')}   value={settings.defaultTransport} onChange={v => set('defaultTransport', v)}
                opts={[['local','Local'],['long_distance','Long Distance'],['export','Export']]} />
              <URow icon={<Target    className="h-4 w-4 text-primary"    />} label={t('analysisPrefs.analysisObjective')}           value={settings.analysisObjective} onChange={v => set('analysisObjective', v)}
                opts={[['balanced','Balanced (Recommended)'],['max_shelf_life','Max Shelf Life'],['min_cost','Lowest Cost'],['sustainability','Sustainability']]} />
              <URow icon={<Calendar  className="h-4 w-4 text-rose-500"   />} label={t('analysisPrefs.defaultShelfLife')}     value={settings.defaultShelfLife}  onChange={v => set('defaultShelfLife', v)}
                opts={[['1-2weeks','1 – 2 weeks'],['1month','1 month'],['3months','3 months'],['6months','6 months'],['1year','1 year']]} />
              <div className="pt-2">
                <Button size="sm" onClick={() => toast.success(t('analysisPrefs.saved'))}>
                  <Save className="h-3.5 w-3.5 mr-1.5" /> {tc('save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════ UNITS TAB ══════════════════ */}
      {tab === 'units' && (
        <div className="max-w-2xl space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('units.title')}</CardTitle>
              <CardDescription>{t('units.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <URow icon={<Thermometer className="h-4 w-4 text-orange-500" />} label={t('units.temperature')}       value={settings.temperature}       onChange={v => set('temperature', v)}
                opts={[['celsius','Celsius (°C)'],['fahrenheit','Fahrenheit (°F)'],['kelvin','Kelvin (K)']]} />
              <URow icon={<Weight       className="h-4 w-4 text-blue-500"   />} label={t('units.weight')}            value={settings.weight}            onChange={v => set('weight', v)}
                opts={[['kg','Kilogram (kg)'],['g','Gram (g)'],['lb','Pound (lb)']]} />
              <URow icon={<MapPin       className="h-4 w-4 text-green-600"  />} label={t('units.distance')}          value={settings.distance}          onChange={v => set('distance', v)}
                opts={[['km','Kilometer (km)'],['mi','Mile (mi)']]} />
              <URow icon={<Gauge        className="h-4 w-4 text-purple-500" />} label={t('units.pressure')}          value={settings.pressure}          onChange={v => set('pressure', v)}
                opts={[['kpa','kPa'],['atm','atm'],['bar','bar'],['psi','psi']]} />
              <URow icon={<FlaskConical className="h-4 w-4 text-cyan-500"   />} label={t('units.gasConcentration')} value={settings.gasConcentration}  onChange={v => set('gasConcentration', v)}
                opts={[['percentage','Percentage (%)'],['ppm','ppm']]} />
              <URow icon={<Zap          className="h-4 w-4 text-yellow-500" />} label={t('units.energy')}            value={settings.energy}            onChange={v => set('energy', v)}
                opts={[['kcal','Kilocalorie (kcal)'],['kj','Kilojoule (kJ)']]} />
              <div className="pt-2">
                <Button size="sm" onClick={() => toast.success(t('units.saved'))}>
                  <Save className="h-3.5 w-3.5 mr-1.5" /> {tc('save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════ DATA SOURCES TAB ══════════════════ */}
      {tab === 'sources' && (
        <div className="max-w-2xl space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('dataSources.fullTitle')}</CardTitle>
              <CardDescription>{t('dataSources.fullSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DATA_SOURCES.map(ds => (
                <div key={ds.id} className="flex items-center gap-4">
                  <div className={cn('flex h-10 w-12 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white', ds.color)}>{ds.abbr}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{ds.name}</p>
                    <p className="text-xs text-muted-foreground">{ds.desc}</p>
                  </div>
                  <Switch checked={settings.dataSources[ds.id]} onCheckedChange={() => toggleSource(ds.id)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════ NOTIFICATIONS TAB ══════════════════ */}
      {tab === 'notifications' && (
        <div className="max-w-2xl space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('notifications.fullTitle')}</CardTitle>
              <CardDescription>{t('notifications.fullSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {[
                { id: 'analysisComplete',    icon: <CheckCircle2  className="h-5 w-5 text-primary"      />, label: t('notifications.analysisComplete'),    desc: t('notifications.analysisCompleteDesc') },
                { id: 'projectUpdates',      icon: <FolderOpen    className="h-5 w-5 text-amber-600"    />, label: t('notifications.projectUpdates'),        desc: t('notifications.projectUpdatesDesc') },
                { id: 'newData',             icon: <Plus          className="h-5 w-5 text-green-600"    />, label: t('notifications.newData'),       desc: t('notifications.newDataDesc') },
                { id: 'systemAnnouncements', icon: <AlertTriangle className="h-5 w-5 text-blue-500"    />, label: t('notifications.systemAnnouncements'),   desc: t('notifications.systemAnnouncementsDesc') },
                { id: 'weeklyInsights',      icon: <TrendingUp    className="h-5 w-5 text-purple-500"   />, label: t('notifications.weeklyInsights'),        desc: t('notifications.weeklyInsightsDesc') },
                { id: 'monthlyDigest',       icon: <Newspaper     className="h-5 w-5 text-slate-500"   />, label: t('notifications.monthlyDigest'),         desc: t('notifications.monthlyDigestDesc') },
              ].map(n => (
                <div key={n.id} className="flex items-center gap-4 py-3.5">
                  <span className="shrink-0">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch checked={!!settings.notifications[n.id]} onCheckedChange={() => toggleNotif(n.id)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════ SECURITY TAB ══════════════════ */}
      {tab === 'security' && (
        <div className="max-w-2xl space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{t('security.title')}</CardTitle>
              <CardDescription>{t('security.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0.5">
              <SRow icon={<Lock        className="h-4 w-4 text-muted-foreground" />} label={t('security.changePassword')}           desc={t('security.changePasswordDesc')}          onClick={() => setDialog('password')} />
              <SRow icon={<Fingerprint className="h-4 w-4 text-muted-foreground" />} label={t('security.twoFactor')}  desc={t('security.twoFactorDesc')}        onClick={() => setDialog('2fa')} />
              <SRow icon={<Layers      className="h-4 w-4 text-muted-foreground" />} label={t('security.manageSessions')}            desc={t('security.manageSessionsDesc')}       onClick={() => setDialog('sessions')} />
              <SRow icon={<FileText    className="h-4 w-4 text-muted-foreground" />} label={t('security.dataPrivacy')}               desc={t('security.dataPrivacyDesc')} onClick={() => setDialog('privacy')} />
              <SRow icon={<Trash2      className="h-4 w-4 text-destructive"      />} label={t('security.deleteAccount')}             desc={t('security.deleteAccountDesc')}       onClick={() => setDialog('delete')} destructive />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════ DIALOGS (mock) ══════════════════ */}
      {dialog && (
        <DialogBackdrop onClose={() => setDialog(null)}>
          {dialog === 'password' && <PasswordDialog onClose={() => setDialog(null)} />}
          {dialog === '2fa'      && <TwoFADialog    onClose={() => setDialog(null)} />}
          {dialog === 'sessions' && <SessionsDialog onClose={() => setDialog(null)} />}
          {dialog === 'privacy'  && <PrivacyDialog  onClose={() => setDialog(null)} />}
          {dialog === 'delete'   && <DeleteDialog   onClose={() => setDialog(null)} />}
        </DialogBackdrop>
      )}
    </div>
  );
}

// ─── Small helper components ───────────────────────────────────────────────────

const inputCls = 'w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring/40 focus:border-ring placeholder:text-muted-foreground/60';

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

/** Single row with icon + label on left, Select on right */
function URow({
  icon, label, value, onChange, opts,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string | null) => void;
  opts: [string, string][];
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0">{icon}</span>
      <span className="flex-1 text-sm">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-40 h-8 text-xs shrink-0"><SelectValue /></SelectTrigger>
        <SelectContent>
          {opts.map(([v, l]) => <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Notification row with switch */
function NRow({ icon, label, desc, checked, onChange }: {
  icon: React.ReactNode; label: string; desc: string; checked: boolean; onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

/** Security action row */
function SRow({ icon, label, desc, onClick, destructive = false }: {
  icon: React.ReactNode; label: string; desc: string; onClick: () => void; destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors',
        destructive ? 'hover:bg-destructive/10' : 'hover:bg-secondary/60',
      )}
    >
      <span className="shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', destructive && 'text-destructive')}>{label}</p>
        <p className={cn('text-xs', destructive ? 'text-destructive/70' : 'text-muted-foreground')}>{desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}

// ─── Dialog scaffold ───────────────────────────────────────────────────────────

function DialogBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}

function DialogShell({ title, desc, onClose, children, footer }: {
  title: string; desc?: string; onClose: () => void;
  children: React.ReactNode; footer?: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md rounded-2xl bg-card ring-1 ring-foreground/10 shadow-2xl overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-border">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
        </div>
        <button onClick={onClose} className="rounded-lg p-1 hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors mt-0.5">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
      {footer && <div className="flex justify-end gap-2 px-6 pb-5">{footer}</div>}
    </div>
  );
}

// ─── Change Password ───────────────────────────────────────────────────────────

function PasswordDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations('dialogs.password');
  const tc = useTranslations('common');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const valid = form.current && form.next.length >= 8 && form.next === form.confirm;

  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(t('success'));
      onClose();
    }, 1000);
  };

  const fields = [
    { key: 'current' as const, label: t('currentPassword'), placeholder: t('currentPlaceholder') },
    { key: 'next' as const, label: t('newPassword'), placeholder: t('newPlaceholder') },
    { key: 'confirm' as const, label: t('confirmPassword'), placeholder: t('confirmPlaceholder') },
  ];

  return (
    <DialogShell
      title={t('title')}
      desc={t('subtitle')}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>{tc('cancel')}</Button>
          <Button size="sm" disabled={!valid || loading} onClick={submit}>
            {loading ? t('saving') : t('updateBtn')}
          </Button>
        </>
      }
    >
      {fields.map(({ key, label, placeholder }) => (
        <FormField key={key} label={label}>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              className={cn(inputCls, 'pr-9')}
              placeholder={placeholder}
              value={form[key]}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
            />
            <button type="button" onClick={() => setShow(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {key === 'confirm' && form.confirm && form.next !== form.confirm && (
            <p className="text-xs text-destructive mt-1">{t('passwordMismatch')}</p>
          )}
        </FormField>
      ))}
    </DialogShell>
  );
}

// ─── Two-Factor Authentication ─────────────────────────────────────────────────

function TwoFADialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations('dialogs.twoFactor');
  const tc = useTranslations('common');
  const [enabled, setEnabled] = useState(false);
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'info' | 'verify'>('info');
  const [loading, setLoading] = useState(false);

  const verify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEnabled(true);
      toast.success(t('success'));
      onClose();
    }, 1000);
  };

  return (
    <DialogShell
      title={t('title')}
      desc={t('subtitle')}
      onClose={onClose}
      footer={
        step === 'info'
          ? <><Button variant="outline" size="sm" onClick={onClose}>{tc('cancel')}</Button>
             <Button size="sm" onClick={() => setStep('verify')}>{t('setUp')}</Button></>
          : <><Button variant="outline" size="sm" onClick={() => setStep('info')}>{t('back')}</Button>
             <Button size="sm" disabled={code.length !== 6 || loading} onClick={verify}>{loading ? t('verifying') : t('verifyBtn')}</Button></>
      }
    >
      {step === 'info' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-accent p-3">
            <Fingerprint className="h-5 w-5 text-primary shrink-0" />
            <p className="text-xs text-accent-foreground">{t('infoText')}</p>
          </div>
          <p className="text-sm text-muted-foreground">{t('descText')}</p>
          <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-2', enabled ? 'border-primary/30 bg-accent' : 'border-border')}>
            <div className={cn('h-2 w-2 rounded-full', enabled ? 'bg-primary' : 'bg-muted-foreground')} />
            <span className="text-xs font-medium">{enabled ? t('enabled') : t('disabled')}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('scanQR')}</p>
          <div className="flex items-center justify-center rounded-xl border border-border bg-white p-4">
            {/* Mock QR code */}
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: 49 }).map((_, i) => (
                <div key={i} className={cn('h-4 w-4 rounded-sm', Math.random() > 0.5 ? 'bg-black' : 'bg-white')} />
              ))}
            </div>
          </div>
          <FormField label={t('verificationCode')}>
            <input className={inputCls} placeholder={t('codePlaceholder')} maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} />
          </FormField>
        </div>
      )}
    </DialogShell>
  );
}

// ─── Manage Sessions ───────────────────────────────────────────────────────────

function SessionsDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations('dialogs.sessions');
  const [sessions, setSessions] = useState(MOCK_SESSIONS);

  const revoke = (id: number) => {
    setSessions(p => p.filter(s => s.id !== id));
    toast.success(t('revokeSuccess'));
  };

  return (
    <DialogShell
      title={t('title')}
      desc={t('subtitle')}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => { setSessions([MOCK_SESSIONS[0]]); toast.success(t('revokeAllSuccess')); }}>
            {t('revokeAll')}
          </Button>
          <Button size="sm" onClick={onClose}>{t('done')}</Button>
        </>
      }
    >
      <div className="space-y-3">
        {sessions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{t('noSessions')}</p>}
        {sessions.map(s => (
          <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
            <Layers className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{s.device}</p>
              <p className="text-xs text-muted-foreground">{s.location} · {s.time}</p>
            </div>
            {s.current
              ? <span className="text-xs font-medium text-primary bg-accent px-2 py-0.5 rounded-full shrink-0">{t('current')}</span>
              : <button onClick={() => revoke(s.id)} className="text-xs text-destructive hover:underline shrink-0">{t('revoke')}</button>}
          </div>
        ))}
      </div>
    </DialogShell>
  );
}

// ─── Data Privacy ──────────────────────────────────────────────────────────────

function PrivacyDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations('dialogs.privacy');
  const tc = useTranslations('common');
  const [prefs, setPrefs] = useState({ analytics: true, crashReports: true, personalisation: false });

  const toggle = (k: keyof typeof prefs) => setPrefs(p => ({ ...p, [k]: !p[k] }));

  return (
    <DialogShell
      title={t('title')}
      desc={t('subtitle')}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>{tc('cancel')}</Button>
          <Button size="sm" onClick={() => { toast.success(t('saved')); onClose(); }}>{t('saveSettings')}</Button>
        </>
      }
    >
      <div className="space-y-4">
        {[
          { key: 'analytics' as const,       label: t('analytics'),       desc: t('analyticsDesc') },
          { key: 'crashReports' as const,     label: t('crashReports'),    desc: t('crashReportsDesc') },
          { key: 'personalisation' as const,  label: t('personalisation'), desc: t('personalisationDesc') },
        ].map(p => (
          <div key={p.key} className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium">{p.label}</p>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </div>
            <Switch checked={prefs[p.key]} onCheckedChange={() => toggle(p.key)} />
          </div>
        ))}
        <div className="rounded-lg border border-border px-3 py-2.5 text-xs text-muted-foreground">
          {t('policyText')}{' '}
          <button className="text-primary hover:underline" onClick={() => toast.info(t('policyToast'))}>{t('privacyPolicy')}</button>.
        </div>
      </div>
    </DialogShell>
  );
}

// ─── Delete Account ────────────────────────────────────────────────────────────

function DeleteDialog({ onClose }: { onClose: () => void }) {
  const t = useTranslations('dialogs.delete');
  const tc = useTranslations('common');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const phrase = t('confirmPhrase');

  const del = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.error(t('success'), { description: t('successDesc') });
      onClose();
    }, 1200);
  };

  return (
    <DialogShell
      title={t('title')}
      desc={t('subtitle')}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>{tc('cancel')}</Button>
          <Button variant="destructive" size="sm" disabled={confirm !== phrase || loading} onClick={del}>
            {loading ? t('deleting') : t('deleteBtn')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">
            {t('warningText')}
          </p>
        </div>
        <FormField label={t('confirmLabel', { phrase })}>
          <input
            className={inputCls}
            placeholder={phrase}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
        </FormField>
      </div>
    </DialogShell>
  );
}
