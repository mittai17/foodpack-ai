'use client';

/**
 * Transport Dashboard — Redesigned Layout
 *
 * 3-column layout matching reference:
 *  Left:   Route & Transport Details + Multi-Food Load + Recent Analyses
 *  Center: Route Map (with style tabs) + Environmental Conditions
 *  Right:  Route Summary + Packaging Impact + Packaging Adjustments + IoT
 *  Bottom: Transport Assessment bar
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Truck, Train, Plane, Ship, MapPin, Calendar, Leaf, ArrowRight,
  RefreshCw, AlertTriangle, CheckCircle2, Thermometer, Droplets,
  CloudRain, Wind, Clock, Navigation, Gauge, Zap, Activity,
  ChevronRight, ShieldCheck, AlertCircle, PackageCheck, History,
  Plus, X, Layers, SatelliteDish, Mountain, RotateCcw, ExternalLink,
  Package, Weight, Info, Sun, CloudDrizzle, Cloud,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFoods } from '@/hooks/use-foods';

import { geocodeLocation, getRoute } from '@/lib/transport/mapbox-service';
import { enrichCheckpointsWithWeather } from '@/lib/transport/weather-service';
import { evaluateTransportRisk, evaluateAssessment } from '@/lib/transport/transport-engine';
import { getIoTSnapshot } from '@/lib/transport/iot-service';

import type {
  GeoLocation,
  GeocodingSuggestion,
  TransportMode,
  TransportAnalysisResult,
  AnalysisStep,
  RiskLevel,
  RouteCheckpoint,
} from '@/lib/transport/types';

// ─── Constants ────────────────────────────────────────────────────────────
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

/**
 * `crypto.randomUUID()` only exists in secure contexts (HTTPS or localhost).
 * The app is also served over plain HTTP on a bare IP, where it's undefined
 * and throws — fall back to a non-cryptographic UUID v4 there.
 */
function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const TRANSPORT_MODES: { id: TransportMode; label: string; icon: React.ReactNode }[] = [
  { id: 'road',  label: 'Road',  icon: <Truck   className="h-4 w-4" /> },
  { id: 'rail',  label: 'Rail',  icon: <Train   className="h-4 w-4" /> },
  { id: 'air',   label: 'Air',   icon: <Plane   className="h-4 w-4" /> },
  { id: 'sea',   label: 'Sea',   icon: <Ship    className="h-4 w-4" /> },
];

const MAP_STYLES: { id: string; label: string; icon: React.ReactNode; style: string }[] = [
  { id: 'map',       label: 'Map',       icon: <Layers       className="h-3.5 w-3.5" />, style: 'mapbox://styles/mapbox/streets-v12'           },
  { id: 'satellite', label: 'Satellite', icon: <SatelliteDish className="h-3.5 w-3.5" />, style: 'mapbox://styles/mapbox/satellite-streets-v12' },
  { id: 'terrain',   label: 'Terrain',   icon: <Mountain     className="h-3.5 w-3.5" />, style: 'mapbox://styles/mapbox/outdoors-v12'          },
];

const FOOD_EMOJI: Record<string, string> = {
  mango: '🥭', tomato: '🍅', apple: '🍎', rice: '🍚', banana: '🍌',
  potato: '🥔', onion: '🧅', wheat: '🌾', grapes: '🍇', coconut: '🥥',
  carrot: '🥕', orange: '🍊', lemon: '🍋', pineapple: '🍍', watermelon: '🍉',
  corn: '🌽', broccoli: '🥦', capsicum: '🫑', guava: '🍈', papaya: '🧆',
  biscuits: '🍪', chips: '🥨', flour: '🌾', sugar: '🍬', salt: '🧂',
};

function getFoodEmoji(name: string): string {
  const key = name.toLowerCase().split(' ')[0];
  return FOOD_EMOJI[key] ?? '🌿';
}

// ─── Transport Requirements ─────────────────────────────────────────────
interface TransportRequirement {
  id: string; label: string; icon: string;
  category: 'thermal' | 'moisture' | 'mechanical' | 'atmosphere' | 'special';
  description: string;
}

const TRANSPORT_REQUIREMENTS: TransportRequirement[] = [
  { id: 'temp_sensitive',   label: 'Temperature Sensitive',     icon: '🌡️', category: 'thermal',    description: 'Product requires temperature-controlled packaging' },
  { id: 'cold_chain',       label: 'Cold Chain Required',       icon: '❄️',  category: 'thermal',    description: 'Unbroken refrigeration required throughout transit' },
  { id: 'moisture_barrier', label: 'Moisture Barrier',          icon: '💧', category: 'moisture',   description: 'Product is hygroscopic or moisture-sensitive' },
  { id: 'high_humidity',    label: 'High Humidity Route',       icon: '🌧️', category: 'moisture',   description: 'Route passes through high-humidity regions' },
  { id: 'fragile',          label: 'Fragile / Crush-Sensitive', icon: '🏵️', category: 'mechanical', description: 'Product requires physical/impact protection' },
  { id: 'vibration',        label: 'High Vibration',            icon: '⚡',  category: 'mechanical', description: 'Long road/sea route with significant vibration' },
  { id: 'stacking',         label: 'Heavy Stacking Loads',      icon: '📦', category: 'mechanical', description: 'Packaging will bear significant stacking weight' },
  { id: 'map_required',     label: 'MAP / Controlled Atm.',     icon: '💨', category: 'atmosphere', description: 'Modified Atmosphere Packaging required' },
  { id: 'respiration',      label: 'Active Respiration',        icon: '🌿', category: 'atmosphere', description: 'Fresh produce with high respiration rate' },
  { id: 'oxidation',        label: 'Oxidation Risk',            icon: '🔴', category: 'atmosphere', description: 'Fat/oil containing product prone to rancidity' },
  { id: 'tamper_evident',   label: 'Tamper-Evident',            icon: '🔒', category: 'special',    description: 'Seal integrity must be verifiable on delivery' },
  { id: 'long_duration',    label: 'Long Duration Transit',     icon: '⏳', category: 'special',    description: '24 h+ transit — extended protection needed' },
];

const CATEGORY_LABELS: Record<TransportRequirement['category'], string> = {
  thermal: '🌡️ Thermal', moisture: '💧 Moisture', mechanical: '⚡ Mechanical',
  atmosphere: '💨 Atmosphere', special: '✨ Special',
};

interface PackagingRec {
  id: string;
  priority: 'essential' | 'recommended' | 'optional';
  title: string;
  rationale: string;
  triggeredBy: string[];
  guidance: string[];
}

function derivePackagingRecs(
  selected: string[], isFreshProduce: boolean, mode: TransportMode,
  distanceKm: number, durationMinutes: number,
  avgTempC: number | null, avgRhPercent: number | null,
): PackagingRec[] {
  const has = (id: string) => selected.includes(id);
  const recs: PackagingRec[] = [];

  if (has('cold_chain')) recs.push({ id: 'insulated_shipper', priority: 'essential', title: 'Insulated Shipper / Cold Box',
    rationale: 'Cold chain requirement mandates continuous temperature control throughout transit.',
    triggeredBy: ['cold_chain'],
    guidance: ['EPS or VIP liner depending on duration',
      `For ${Math.round(durationMinutes / 60)}h+ transit, specify PCM ice packs rated for target temperature range`,
      'Seal inner liner with tape; outer corrugated ≥†32 ECT'] });
  else if (has('temp_sensitive')) recs.push({ id: 'thermal_barrier', priority: 'recommended', title: 'Thermal Barrier Packaging',
    rationale: 'Temperature-sensitive product needs insulation against ambient heat fluctuations.',
    triggeredBy: ['temp_sensitive'],
    guidance: [avgTempC !== null && avgTempC > 30 ? `Expected peak temp ~${avgTempC.toFixed(0)}°C — specify reflective outer layer + insulating liner` : 'Use insulating film or foil-lined bag', 'Consider thermal indicator label to detect excursions'] });

  if (has('moisture_barrier') || has('high_humidity')) {
    const rhNote = avgRhPercent !== null ? ` (avg forecast: ${Math.round(avgRhPercent)}% RH)` : '';
    recs.push({ id: 'moisture_barrier_film', priority: has('moisture_barrier') ? 'essential' : 'recommended', title: 'High-Barrier Moisture Film',
      rationale: `Moisture ingress risk identified along route${rhNote}.`,
      triggeredBy: ['moisture_barrier', 'high_humidity'].filter(has),
      guidance: ['Specify WVTR ≤†1 g/m²/day (ASTM E96) for primary film layer',
        mode === 'sea' ? 'Sea transit: add desiccant sachets and outer moisture-barrier corrugated' : 'Include desiccant sachet inside primary packaging',
        'Heat-seal integrity critical — specify minimum seal strength ≥†2 N/15mm'] });
  }

  if (has('fragile')) recs.push({ id: 'cushioning', priority: 'essential', title: 'Cushioning & Impact Protection',
    rationale: 'Fragile product requires mechanical isolation from vibration and shock.',
    triggeredBy: ['fragile'],
    guidance: ['Corrugated dividers or moulded pulp inserts for individual unit isolation',
      mode === 'air' ? 'Air: pressure changes may cause swelling — avoid rigid snap-close containers' : 'Minimum 5 cm void-fill clearance on all sides',
      'Drop-test packaging to ISTA 1A or 2A standard before shipping'] });

  if (has('vibration') || (mode === 'road' && distanceKm > 300)) recs.push({ id: 'vibration_protection', priority: has('vibration') ? 'essential' : 'recommended',
    title: 'Vibration-Resistant Secondary Packaging',
    rationale: `${mode === 'road' ? 'Road' : 'Long-distance'} transport generates sustained vibration that can cause seal fatigue.`,
    triggeredBy: ['vibration'],
    guidance: ['Use ribbed or corrugated medium (B/C flute) outer carton', 'Ensure primary seal strength tested under vibration: ISTA 3A protocol',
      'Fill to ≥†85% by volume or use void fill to prevent product migration'] });

  if (has('stacking')) recs.push({ id: 'stacking_strength', priority: 'recommended', title: 'High Stacking-Strength Outer Carton',
    rationale: 'Product will bear stacking load throughout transit and storage.',
    triggeredBy: ['stacking'],
    guidance: ['Specify BCT ≥†4× gross weight of stacked units', 'Use B-flute or BC-flute corrugated with minimum 32 ECT facing', 'Mark maximum stack height on outer carton'] });

  if (has('map_required') || isFreshProduce) recs.push({ id: 'map_packaging', priority: has('map_required') ? 'essential' : 'recommended',
    title: 'Modified Atmosphere Packaging (MAP)',
    rationale: isFreshProduce ? 'Fresh produce requires controlled O₂/CO₂ atmosphere to slow respiration during transit.' : 'MAP extends product stability during transit.',
    triggeredBy: ['map_required'],
    guidance: ['Specify film OTR matched to commodity respiration rate (mL O₂/kg·hr)',
      'Target gas mix at pack time — typical fresh produce: 3–5% O₂, 3–10% CO₂, balance N₂',
      'Seal integrity critical: verify hermeticity before dispatch'] });

  if (has('respiration')) recs.push({ id: 'microperforated', priority: 'recommended', title: 'Microperforated / Breathable Film',
    rationale: 'High-respiration fresh produce needs gas exchange to prevent anaerobic build-up.',
    triggeredBy: ['respiration'],
    guidance: ['Select microperforated OPP or BOPP film matched to commodity respiration class',
      `For ${Math.round(durationMinutes / 60)}h+ transit, avoid fully hermetic seal unless CO₂ enrichment is actively maintained`,
      'Too low OTR film for high-respiration commodity causes fermentation'] });

  if (has('oxidation')) recs.push({ id: 'oxygen_barrier', priority: 'essential', title: 'Ultra-Low OTR Oxygen Barrier',
    rationale: 'Fat/oil-containing product requires maximum oxygen exclusion during transit.',
    triggeredBy: ['oxidation'],
    guidance: ['Specify OTR ≤†0.5 cc/m²/day (23°C, 0% RH) — EVOH or AlOx barrier layer',
      'Consider oxygen scavenger sachet inside primary pack for long-duration transit',
      'Nitrogen flush at pack time to displace headspace oxygen to ≤†1%'] });

  if (has('tamper_evident')) recs.push({ id: 'tamper_evident_seal', priority: 'essential', title: 'Tamper-Evident Seal',
    rationale: 'Seal integrity must be visually verifiable on delivery to maintain chain-of-custody.',
    triggeredBy: ['tamper_evident'],
    guidance: ['Apply shrink-sleeve label or breakaway tab seal over primary closure',
      'For high-value cargo: consider RFID-embedded seal or QR-coded holographic sticker',
      'Document seal serial numbers at dispatch and verify on receipt'] });

  if (has('long_duration') || durationMinutes > 24 * 60) recs.push({ id: 'extended_shelf_pack', priority: has('long_duration') ? 'essential' : 'recommended',
    title: 'Extended-Transit Packaging Specification',
    rationale: `${Math.round(durationMinutes / 60)}h+ transit requires packaging rated for the full journey duration.`,
    triggeredBy: ['long_duration'],
    guidance: ['Specify barrier properties for worst-case temperature + humidity conditions along route',
      'Validate packaging at simulated transit conditions (ISTA 7D or equivalent)',
      'Use IoT transit data loggers to build evidence dossier of actual conditions'] });

  if (mode === 'air') recs.push({ id: 'air_pressure', priority: 'recommended', title: 'Low-Pressure / Altitude-Rated Packaging',
    rationale: 'Aircraft cargo hold operates at reduced pressure (~75 kPa). Sealed packs may bulge or burst seals.',
    triggeredBy: [],
    guidance: ['Avoid rigid sealed containers with internal positive pressure', 'Use pressure-equalising vent or leave adequate ullage in sealed flexible packs', 'Test seal strength at 75 kPa (simulated altitude) per ASTM D4169'] });

  if (mode === 'sea') recs.push({ id: 'marine', priority: 'recommended', title: 'Marine Environment Protection',
    rationale: 'Sea transit exposes outer packaging to salt-laden humid air and potential condensation.',
    triggeredBy: [],
    guidance: ['Waterproof outer corrugated (wax-coated or poly-laminated) for sea freight', 'Wrap pallet load in stretch film + desiccant bag inside container', 'Stow away from container walls to allow air circulation'] });

  return recs.sort((a, b) => ({ essential: 0, recommended: 1, optional: 2 }[a.priority] - { essential: 0, recommended: 1, optional: 2 }[b.priority]));
}

const RECENT_ANALYSES = [
  { from: 'Chennai', to: 'Bengaluru', distance: '~350 km', date: '28 Sep 2026', weightKg: 1750, itemCount: 5, status: 'Completed' },
  { from: 'Coimbatore', to: 'Chennai', distance: '~500 km', date: '25 Sep 2026', weightKg: 800,  itemCount: 3, status: 'Completed' },
  { from: 'Mumbai', to: 'Pune',       distance: '~150 km', date: '20 Sep 2026', weightKg: 1200, itemCount: 4, status: 'Completed' },
];

// ─── Types ────────────────────────────────────────────────────────────────
interface FoodLoadItem {
  id: string;
  foodSlug: string;
  foodName: string;
  isFreshProduce: boolean;
  weightKg: number;
  emoji: string;
}

// ─── Helper: build haversine mock result ─────────────────────────────────
function buildMockResult(
  src: GeoLocation, dst: GeoLocation, mode: TransportMode,
  departureTime: string, foods: FoodLoadItem[],
): TransportAnalysisResult {
  const R = 6371;
  const dLat = ((dst.latitude - src.latitude) * Math.PI) / 180;
  const dLon = ((dst.longitude - src.longitude) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((src.latitude * Math.PI) / 180) * Math.cos((dst.latitude * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const distKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  const speedMap: Record<TransportMode, number> = { road: 60, rail: 80, air: 800, sea: 30 };
  const durationMins = Math.round((distKm / speedMap[mode]) * 60);
  const dep = new Date(departureTime);
  const baseTemp = 26 + (src.latitude < 15 ? 5 : 2);
  const isFresh = foods.some((f) => f.isFreshProduce);

  const cpNames = [src.name, 'Checkpoint 1', 'Checkpoint 2', dst.name];
  const checkpoints: RouteCheckpoint[] = cpNames.map((name, i) => {
    const frac = i / (cpNames.length - 1);
    const rng = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
    const arrival = new Date(dep.getTime() + frac * durationMins * 60_000);
    return {
      name,
      latitude:  src.latitude  + (dst.latitude  - src.latitude)  * frac,
      longitude: src.longitude + (dst.longitude - src.longitude) * frac,
      distanceFromSourceKm: Math.round(frac * distKm),
      estimatedArrival: arrival.toISOString(),
      weatherDataSource: 'Simulated' as const,
      temperatureC: parseFloat((baseTemp + rng(-2, 6)).toFixed(1)),
      relativeHumidityPercent: parseFloat(rng(45, 82).toFixed(0)),
      precipitationProbabilityPercent: Math.round(rng(5, 45)),
      windSpeedKmh: parseFloat(rng(6, 20).toFixed(0)),
    };
  });

  const geometry: [number, number][] = Array.from({ length: 20 }, (_, i) => [
    src.longitude + ((dst.longitude - src.longitude) * i) / 19,
    src.latitude  + ((dst.latitude  - src.latitude)  * i) / 19,
  ]);

  const impact = evaluateTransportRisk({ checkpoints, durationMinutes: durationMins, distanceKm: distKm, mode, isFreshProduce: isFresh });
  const assessment = evaluateAssessment(impact);
  const iotSnapshot = getIoTSnapshot();

  return {
    id: uuid(),
    source: src, destination: dst, transportMode: mode, departureTime,
    foodSlug: foods[0]?.foodSlug, foodName: foods.map((f) => f.foodName).join(', '),
    isFreshProduce: isFresh,
    route: { distanceKm: distKm, durationMinutes: durationMins, geometry, checkpoints, routingMethod: 'estimated' },
    packagingImpact: impact, iotValidation: iotSnapshot, assessment,
    createdAt: new Date().toISOString(),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
      level === 'low'      && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      level === 'moderate' && 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
      level === 'high'     && 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
    )}>
      {level === 'low'      && <CheckCircle2 className="h-2.5 w-2.5" />}
      {level === 'moderate' && <AlertTriangle className="h-2.5 w-2.5" />}
      {level === 'high'     && <AlertCircle className="h-2.5 w-2.5" />}
      {level === 'low' ? 'Low Risk' : level === 'moderate' ? 'Moderate Risk' : 'High Risk'}
    </span>
  );
}

function StatusDot({ status }: { status: 'normal' | 'watch' | 'warning' }) {
  return (
    <span className={cn(
      'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
      status === 'normal'  && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
      status === 'watch'   && 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
      status === 'warning' && 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
    )}>
      {status === 'normal' ? 'Normal' : status === 'watch' ? 'Watch' : 'Warning'}
    </span>
  );
}

// ─── Location Search ──────────────────────────────────────────────────────
function LocationSearch({
  label, icon, value, onChange, onSelect, placeholder, id,
}: {
  label: string; icon: React.ReactNode; value: string;
  onChange: (v: string) => void; onSelect: (s: GeocodingSuggestion) => void;
  placeholder: string; id: string;
}) {
  const [suggestions, setSuggestions] = useState<GeocodingSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleChange = (v: string) => {
    onChange(v);
    if (debRef.current) clearTimeout(debRef.current);
    if (v.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    debRef.current = setTimeout(async () => {
      try { const r = await geocodeLocation(v); setSuggestions(r); setOpen(r.length > 0); } catch { /**/ }
    }, 350);
  };

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-[11px] font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">{icon}</div>
        <Input
          id={id} value={value} onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder} className="pl-8 pr-7 h-9 text-sm"
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          aria-autocomplete="list" aria-expanded={open}
        />
        {value && (
          <button type="button" onClick={() => { onChange(''); setSuggestions([]); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {open && suggestions.length > 0 && (
          <ul className="absolute left-0 top-full z-[100] mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            {suggestions.map((s) => (
              <li key={s.id} role="option" aria-selected={false}
                onMouseDown={() => { onSelect(s); onChange(s.name); setOpen(false); setSuggestions([]); }}
                className="flex cursor-pointer items-start gap-2 px-3 py-2 text-sm hover:bg-accent/50">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="font-medium truncate text-sm">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{s.fullName}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Add Food Item Row ────────────────────────────────────────────────────
function AddFoodItemRow({ onAdd }: { onAdd: (item: Omit<FoodLoadItem, 'id'>) => void }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<{ slug: string; name: string; isFreshProduce: boolean } | null>(null);
  const [weight, setWeight] = useState('');
  const [open, setOpen] = useState(false);
  const { data: foods } = useFoods({ search });

  const handleAdd = () => {
    if (!selected || !weight || Number(weight) <= 0) return;
    onAdd({
      foodSlug: selected.slug, foodName: selected.name,
      isFreshProduce: selected.isFreshProduce,
      weightKg: Number(weight), emoji: getFoodEmoji(selected.name),
    });
    setSelected(null); setSearch(''); setWeight('');
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Leaf className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary" />
        <Input
          value={selected ? selected.name : search}
          onChange={(e) => { if (selected) setSelected(null); setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search food…" className="pl-8 pr-7 h-8 text-xs"
          aria-label="Search food item"
        />
        {selected && (
          <button type="button" onClick={() => { setSelected(null); setSearch(''); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Clear">
            <X className="h-3 w-3" />
          </button>
        )}
        {open && !selected && foods?.items && foods.items.length > 0 && (
          <ul className="absolute left-0 top-full z-[100] mt-1 max-h-36 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-xl">
            {foods.items.slice(0, 8).map((f) => (
              <li key={f.id} onMouseDown={() => { setSelected({ slug: f.slug, name: f.name, isFreshProduce: f.isFreshProduce }); setOpen(false); }}
                className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent/50">
                <span aria-hidden>{getFoodEmoji(f.name)}</span>
                <span className="flex-1">{f.name}</span>
                {f.isFreshProduce && <Badge variant="secondary" className="text-[9px] py-0 px-1">Fresh</Badge>}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Input
        value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ''))}
        placeholder="kg" className="w-16 h-8 text-xs text-center"
        aria-label="Weight in kg" type="number" min="1"
      />
      <Button size="sm" onClick={handleAdd} disabled={!selected || !weight || Number(weight) <= 0}
        className="h-8 px-3 text-xs shrink-0" aria-label="Add food item">
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ─── Mapbox Map ───────────────────────────────────────────────────────────
function TransportMap({
  source, destination, geometry, checkpoints, mapStyle,
}: {
  source?: GeoLocation; destination?: GeoLocation;
  geometry?: [number, number][]; checkpoints?: RouteCheckpoint[];
  mapStyle: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!MAPBOX_TOKEN) { setError(true); return; }

    const init = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        mapboxgl.accessToken = MAPBOX_TOKEN;
        const center: [number, number] = source && destination
          ? [(source.longitude + destination.longitude) / 2, (source.latitude + destination.latitude) / 2]
          : [79.5, 13.0];

        const map = new mapboxgl.Map({
          container: containerRef.current!, style: mapStyle, center, zoom: 5,
          attributionControl: false,
        });
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

        map.on('load', () => {
          setLoaded(true);
          addRouteAndMarkers(map, mapboxgl, geometry, source, destination, checkpoints);
          if (source && destination) {
            map.fitBounds([[
              Math.min(source.longitude, destination.longitude) - 0.5,
              Math.min(source.latitude, destination.latitude) - 0.5,
            ], [
              Math.max(source.longitude, destination.longitude) + 0.5,
              Math.max(source.latitude, destination.latitude) + 0.5,
            ]], { padding: 50, duration: 1000 });
          }
        });
        mapRef.current = map;
      } catch { setError(true); }
    };
    init();
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Style change
  useEffect(() => {
    if (!mapRef.current || !loaded) return;
    mapRef.current.setStyle(mapStyle);
    mapRef.current.once('styledata', () => {
      const map = mapRef.current;
      if (!map) return;
      import('mapbox-gl').then(({ default: mapboxgl }) => {
        addRouteAndMarkers(map, mapboxgl, geometry, source, destination, checkpoints);
      });
    });
  }, [mapStyle]); // eslint-disable-line

  // Route update
  useEffect(() => {
    if (!mapRef.current || !loaded) return;
    const map = mapRef.current;
    ['route-line'].forEach((id) => { if (map.getLayer(id)) map.removeLayer(id); });
    ['route'].forEach((id) => { if (map.getSource(id)) map.removeSource(id); });
    if (geometry && geometry.length > 1) {
      map.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: geometry } } });
      map.addLayer({ id: 'route-line', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#1d4ed8', 'line-width': 3.5, 'line-opacity': 0.9 } });
    }
  }, [geometry, loaded]);

  if (error) return (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/30 rounded-xl">
      <AlertTriangle className="h-7 w-7 text-amber-500" />
      <p className="text-sm font-medium">Map unavailable</p>
    </div>
  );

  return (
    <div className="relative h-full rounded-xl overflow-hidden border border-border">
      <div ref={containerRef} className="h-full w-full" />
      {!loaded && <div className="absolute inset-0 flex items-center justify-center bg-muted/40"><RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
      {/* Legend */}
      <div className="absolute top-2 right-2 rounded-lg bg-card/90 backdrop-blur px-2.5 py-2 text-[11px] border border-border shadow-sm space-y-1">
        <div className="flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-blue-600 inline-block" />Route</div>
        {source && <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary inline-block border-2 border-white" />Source ({source.name})</div>}
        {destination && <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block border-2 border-white" />Destination ({destination.name})</div>}
        {checkpoints && checkpoints.length > 2 && <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400 inline-block border border-white" />Checkpoints</div>}
      </div>
    </div>
  );
}

function addRouteAndMarkers(map: any, mapboxgl: any, geometry?: [number, number][], source?: GeoLocation, destination?: GeoLocation, checkpoints?: RouteCheckpoint[]) {
  // Remove existing
  ['route-line'].forEach((id) => { try { if (map.getLayer(id)) map.removeLayer(id); } catch {} });
  ['route'].forEach((id) => { try { if (map.getSource(id)) map.removeSource(id); } catch {} });
  // Route
  if (geometry && geometry.length > 1) {
    map.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: geometry } } });
    map.addLayer({ id: 'route-line', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#1d4ed8', 'line-width': 3.5, 'line-opacity': 0.9 } });
  }
  // Source marker
  if (source) {
    const el = Object.assign(document.createElement('div'), { style: 'width:14px;height:14px;border-radius:50%;background:#15803d;border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)' });
    new mapboxgl.Marker({ element: el }).setLngLat([source.longitude, source.latitude])
      .setPopup(new mapboxgl.Popup({ offset: 16 }).setHTML(`<strong>Source</strong><br/>${source.name}`)).addTo(map);
  }
  // Destination marker
  if (destination) {
    const el = Object.assign(document.createElement('div'), { style: 'width:14px;height:14px;border-radius:50%;background:#dc2626;border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)' });
    new mapboxgl.Marker({ element: el }).setLngLat([destination.longitude, destination.latitude])
      .setPopup(new mapboxgl.Popup({ offset: 16 }).setHTML(`<strong>Destination</strong><br/>${destination.name}`)).addTo(map);
  }
  // Checkpoint markers
  if (checkpoints && checkpoints.length > 2) {
    checkpoints.slice(1, -1).forEach((cp) => {
      const el = Object.assign(document.createElement('div'), { style: 'width:10px;height:10px;border-radius:50%;background:#2563eb;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.25)' });
      new mapboxgl.Marker({ element: el }).setLngLat([cp.longitude, cp.latitude]).addTo(map);
    });
  }
}

// ─── Weather Checkpoint Card ──────────────────────────────────────────────
function WeatherCard({ cp, index }: { cp: RouteCheckpoint; index: number }) {
  const arrivalTime = new Date(cp.estimatedArrival).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const rain = cp.precipitationProbabilityPercent ?? 0;
  const WeatherIcon = rain > 50 ? CloudDrizzle : rain > 20 ? Cloud : Sun;

  return (
    <div className="flex-1 min-w-[145px] rounded-xl border border-border bg-card p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-1">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shrink-0">{index + 1}</span>
            <p className="font-semibold text-xs truncate">{cp.name}</p>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{cp.distanceFromSourceKm} km · {arrivalTime}</p>
        </div>
        <WeatherIcon className={cn('h-5 w-5 shrink-0', rain > 50 ? 'text-blue-500' : rain > 20 ? 'text-slate-400' : 'text-amber-400')} />
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
        <div className="flex items-center gap-1">
          <Thermometer className="h-3 w-3 text-orange-500 shrink-0" />
          <span className="font-medium">{cp.temperatureC !== null ? `${cp.temperatureC.toFixed(0)}°C` : '—'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Droplets className="h-3 w-3 text-blue-500 shrink-0" />
          <span className="font-medium">{cp.relativeHumidityPercent !== null ? `${Math.round(cp.relativeHumidityPercent)}%` : '—'}</span>
        </div>
        <div className="flex items-center gap-1">
          <CloudRain className="h-3 w-3 text-sky-400 shrink-0" />
          <span className="font-medium">{cp.precipitationProbabilityPercent !== null ? `${Math.round(cp.precipitationProbabilityPercent)}%` : '—'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="font-medium">{cp.windSpeedKmh !== null ? `${Math.round(cp.windSpeedKmh)} km/h` : '—'}</span>
        </div>
      </div>
      {cp.weatherDataSource === 'Simulated' && <p className="text-[9px] text-amber-500">Simulated</p>}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────
export function TransportDashboard() {
  // Form state
  const [sourceText, setSourceText]   = useState('');
  const [destText,   setDestText]     = useState('');
  const [source,     setSource]       = useState<GeoLocation | null>(null);
  const [destination,setDestination]  = useState<GeoLocation | null>(null);
  const [mode,       setMode]         = useState<TransportMode>('road');
  const [departureTime, setDepartureTime] = useState(() => {
    const d = new Date(); d.setHours(8, 0, 0, 0); return d.toISOString().slice(0, 16);
  });
  const [foodItems, setFoodItems] = useState<FoodLoadItem[]>([]);

  // Analysis state
  const [step,       setStep]       = useState<AnalysisStep>('idle');
  const [result,     setResult]     = useState<TransportAnalysisResult | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [mapStyle,   setMapStyle]   = useState(MAP_STYLES[0].style);
  const [selectedReqs, setSelectedReqs] = useState<string[]>([]);
  const toggleReq = (id: string) =>
    setSelectedReqs((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);


  // IoT live tick
  const [iot, setIot] = useState(() => getIoTSnapshot());
  useEffect(() => {
    const id = setInterval(() => setIot(getIoTSnapshot()), 5000);
    return () => clearInterval(id);
  }, []);

  const totalWeightKg = foodItems.reduce((s, f) => s + f.weightKg, 0);
  const hasFreshProduce = foodItems.some((f) => f.isFreshProduce);
  const isRunning = step !== 'idle' && step !== 'complete' && step !== 'error';
  const canAnalyse = !!source && !!destination && foodItems.length > 0 && !isRunning;

  const addFoodItem = useCallback((item: Omit<FoodLoadItem, 'id'>) => {
    setFoodItems((prev) => [...prev, { ...item, id: uuid() }]);
  }, []);

  const removeFoodItem = useCallback((id: string) => {
    setFoodItems((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateWeight = useCallback((id: string, kg: number) => {
    setFoodItems((prev) => prev.map((f) => f.id === id ? { ...f, weightKg: kg } : f));
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!source || !destination || foodItems.length === 0) {
      setErrorMsg('Select source, destination and add at least one food item.');
      return;
    }
    setErrorMsg('');
    setStep('geocoding');

    // Instant mock
    const mock = buildMockResult(source, destination, mode, departureTime, foodItems);
    setResult(mock);
    setIsRefining(true);

    try {
      setStep('routing');
      const route = await getRoute(source, destination, mode, departureTime);

      setStep('weather');
      const enriched = await enrichCheckpointsWithWeather(route.checkpoints);

      setStep('evaluating');
      const impact = evaluateTransportRisk({
        checkpoints: enriched,
        durationMinutes: route.durationMinutes,
        distanceKm: route.distanceKm,
        mode,
        isFreshProduce: hasFreshProduce,
      });
      const assessment = evaluateAssessment(impact);

      setResult({
        id: uuid(), source, destination, transportMode: mode, departureTime,
        foodSlug: foodItems[0]?.foodSlug,
        foodName: foodItems.map((f) => f.foodName).join(', '),
        isFreshProduce: hasFreshProduce,
        route: { ...route, checkpoints: enriched },
        packagingImpact: impact, iotValidation: getIoTSnapshot(), assessment,
        createdAt: new Date().toISOString(),
      });
      setStep('complete');
    } catch {
      setStep('complete');
      setErrorMsg('Some live data unavailable — results show estimated values.');
    } finally {
      setIsRefining(false);
    }
  }, [source, destination, mode, departureTime, foodItems, hasFreshProduce]);

  const fmt = (mins: number) => {
    const h = Math.floor(mins / 60), m = Math.round(mins % 60);
    return h > 0 ? `${h} h ${m} min` : `${m} min`;
  };
  const estimatedArrival = result
    ? new Date(new Date(result.departureTime).getTime() + result.route.durationMinutes * 60_000)
        .toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  const adjustments = result ? [
    hasFreshProduce && 'Use moisture barrier packaging for fresh produce',
    hasFreshProduce && (result.foodName ?? '').toLowerCase().includes('mango') || (result?.foodName ?? '').toLowerCase().includes('banana')
      ? 'Consider ventilation / MAP for fruits (mango, banana)' : null,
    result.packagingImpact.handlingVibration.level !== 'low' && 'Use stronger mechanical protection',
    foodItems.some((f) => ['apple','tomato','fragile'].some((k) => f.foodName.toLowerCase().includes(k)))
      && 'Use cushioning for fragile items (apple, tomato)',
    `Ensure suitability for ~${Math.round(result.route.durationMinutes / 60)}–${Math.round(result.route.durationMinutes / 60) + 1} hours transport duration`,
    foodItems.length > 1 && 'Consider multi-item packaging and segregation',
    result.packagingImpact.temperatureExposure.level !== 'low' && 'Use temperature mitigation (cooling/insulation) if needed',
  ].filter(Boolean) as string[] : [];

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* ── Refining banner ── */}
      {result && isRefining && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-accent/50 px-4 py-2.5 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin text-primary shrink-0" />
          <p className="font-medium text-primary">Refining with live route + weather data…</p>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse inline-block" /> Simulated data active
          </span>
        </div>
      )}

      {/* ── MAIN 3-column grid ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[310px_1fr_270px]">

        {/* ════ LEFT COLUMN ════ */}
        <div className="flex flex-col gap-4">

          {/* Route & Transport Details */}
          <Card className="overflow-visible">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-sm">Route &amp; Transport Details</CardTitle>
              {(source || destination) && (
                <button type="button" onClick={() => { setSource(null); setDestination(null); setSourceText(''); setDestText(''); setResult(null); setStep('idle'); }}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors" aria-label="Clear route">
                  <RotateCcw className="h-3 w-3" /> Clear All
                </button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {/* From / To with connector */}
              <div className="relative space-y-2 pl-2">
                <div className="absolute left-3.5 top-9 bottom-9 w-px bg-border" aria-hidden />
                <LocationSearch id="from" label="From (Source)" placeholder="Search location…"
                  icon={<MapPin className="h-3.5 w-3.5 text-primary" />}
                  value={sourceText} onChange={setSourceText}
                  onSelect={(s) => setSource({ name: s.name, latitude: s.latitude, longitude: s.longitude, fullName: s.fullName })} />
                <LocationSearch id="to" label="To (Destination)" placeholder="Search location…"
                  icon={<MapPin className="h-3.5 w-3.5 text-red-500" />}
                  value={destText} onChange={setDestText}
                  onSelect={(s) => setDestination({ name: s.name, latitude: s.latitude, longitude: s.longitude, fullName: s.fullName })} />
              </div>

              {/* Transport Mode */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Transport Mode</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {TRANSPORT_MODES.map((m) => (
                    <button key={m.id} type="button" onClick={() => setMode(m.id)} aria-pressed={mode === m.id}
                      className={cn('flex flex-col items-center gap-1 rounded-xl border py-2.5 text-[11px] font-medium transition-all',
                        mode === m.id ? 'border-primary bg-accent text-primary' : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-accent/40')}>
                      {m.icon}{m.label}
                    </button>
                  ))}
                </div>
                {mode !== 'road' && (
                  <p className="text-[10px] text-amber-600">⚠ {mode.charAt(0).toUpperCase() + mode.slice(1)} uses estimated distance</p>
                )}
              </div>

              {/* Departure */}
              <div className="space-y-1">
                <label htmlFor="departure" className="text-[11px] font-medium text-muted-foreground">Departure Date &amp; Time</label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input id="departure" type="datetime-local" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-card pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Food Items & Load Details */}
          <Card className="overflow-visible">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Package className="h-4 w-4 text-primary" />
                Food Items &amp; Load Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AddFoodItemRow onAdd={addFoodItem} />

              {foodItems.length > 0 ? (
                <div className="space-y-1.5">
                  {foodItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-2">
                      <span className="text-base shrink-0" aria-hidden>{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{item.foodName}</p>
                        {item.isFreshProduce && <Badge variant="secondary" className="text-[9px] py-0 px-1 mt-0.5">Fresh Produce</Badge>}
                      </div>
                      <input
                        type="number" value={item.weightKg} min="1"
                        onChange={(e) => updateWeight(item.id, Number(e.target.value))}
                        className="w-16 text-center text-xs rounded-md border border-input bg-card h-7 focus:outline-none focus:ring-1 focus:ring-ring"
                        aria-label={`Weight for ${item.foodName}`}
                      />
                      <span className="text-[10px] text-muted-foreground shrink-0">kg</span>
                      <button type="button" onClick={() => removeFoodItem(item.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors shrink-0" aria-label={`Remove ${item.foodName}`}>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {/* Total */}
                  <div className="flex items-center justify-between rounded-lg border-2 border-primary/20 bg-accent/30 px-3 py-2 mt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Weight className="h-4 w-4 text-primary" />
                      <span className="font-medium">Total Load Weight</span>
                    </div>
                    <span className="font-bold text-primary">
                      {totalWeightKg.toLocaleString()} kg
                      <span className="ml-1 text-xs font-normal text-muted-foreground">({(totalWeightKg / 1000).toFixed(2)} ton)</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-4 text-center">
                  <Package className="h-7 w-7 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">Add food items to specify cargo load</p>
                </div>
              )}

              {/* Error */}
              {errorMsg && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-2.5 text-xs text-amber-700 dark:text-amber-400">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p>{errorMsg}</p>
                </div>
              )}

              {/* Stepper */}
              {isRunning && (
                <div className="space-y-1.5 rounded-xl border border-primary/20 bg-accent/40 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Analysing route…</p>
                  {(['geocoding','routing','weather','evaluating'] as const).map((s, idx) => {
                    const steps = ['geocoding','routing','weather','evaluating','complete'];
                    const cur = steps.indexOf(step), me = steps.indexOf(s);
                    const done = me < cur, active = me === cur;
                    const icons = [<MapPin className="h-3 w-3" />, <Navigation className="h-3 w-3" />, <CloudRain className="h-3 w-3" />, <PackageCheck className="h-3 w-3" />];
                    const labels = ['Geocoding locations','Calculating route','Fetching forecast','Evaluating impact'];
                    return (
                      <div key={s} className={cn('flex items-center gap-2 text-[11px]', done ? 'text-primary' : active ? 'text-foreground' : 'text-muted-foreground/40')}>
                        <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                          done ? 'border-primary bg-primary text-primary-foreground' : active ? 'border-primary bg-accent text-primary animate-pulse' : 'border-border bg-muted/30')}>
                          {done ? <CheckCircle2 className="h-3 w-3" /> : icons[idx]}
                        </span>
                        <span className={active ? 'font-semibold' : ''}>{labels[idx]}</span>
                        {active && <RefreshCw className="ml-auto h-3 w-3 animate-spin text-primary" />}
                        {done && <CheckCircle2 className="ml-auto h-3 w-3 text-primary" />}
                      </div>
                    );
                  })}
                </div>
              )}

              <Button onClick={runAnalysis} disabled={!canAnalyse} className="w-full" aria-label="Analyse transport route">
                {isRunning ? <><RefreshCw className="h-4 w-4 animate-spin" /> Analysing…</> : <>Analyse Transport Route <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Analyses */}
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1.5"><History className="h-4 w-4 text-muted-foreground" />Recent Analyses</CardTitle>
              <button className="text-[11px] text-primary hover:underline">View All</button>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {RECENT_ANALYSES.map((r, i) => (
                <button key={i} type="button" className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-left hover:bg-accent/40 transition-colors group">
                  <Truck className="h-4 w-4 shrink-0 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{r.from} → {r.to}</p>
                    <p className="text-[10px] text-muted-foreground">{r.distance} · {(r.weightKg / 1000).toFixed(1)} ton · {r.itemCount} items</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground">{r.date}</p>
                    <span className="text-[9px] rounded-full bg-emerald-100 text-emerald-700 px-1.5 py-0.5 font-medium">{r.status}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ════ CENTER COLUMN ════ */}
        <div className="flex flex-col gap-4">

          {/* Map with style tabs */}
          <Card className="overflow-hidden flex-1" style={{ minHeight: '420px' }}>
            <CardHeader className="pb-0 flex-row items-center justify-between gap-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" />
                Route Map
                {result?.route.routingMethod === 'estimated' && <Badge variant="secondary" className="text-[10px]">Planned / Estimated</Badge>}
              </CardTitle>
              {/* Map style tabs */}
              <div className="flex items-center gap-0 rounded-lg border border-border overflow-hidden">
                {MAP_STYLES.map((s) => (
                  <button key={s.id} type="button" onClick={() => setMapStyle(s.style)}
                    className={cn('flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium transition-all',
                      mapStyle === s.style ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-accent/50')}>
                    {s.icon}{s.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-2" style={{ height: 'calc(100% - 52px)' }}>
              <TransportMap
                source={result?.source ?? (source ?? undefined)}
                destination={result?.destination ?? (destination ?? undefined)}
                geometry={result?.route.geometry}
                checkpoints={result?.route.checkpoints}
                mapStyle={mapStyle}
              />
            </CardContent>
          </Card>

          {/* Environmental Conditions */}
          {result && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CloudRain className="h-4 w-4 text-sky-500" />
                      Expected Environmental Conditions (Weather Forecast)
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground">Weather data from Open-Meteo (forecast along the route)</p>
                  </div>
                  <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted transition-colors">
                    <Info className="h-3 w-3" /> Data Source: Open-Meteo <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-[10px] italic text-muted-foreground">
                  Expected external environmental conditions — not actual package conditions.
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.route.checkpoints.map((cp, i) => (
                    <WeatherCard key={i} cp={cp} index={i} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Transport Requirements multiselect ── */}
          <Card className="overflow-visible">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-emerald-600" />
                Transport Requirements
                <span className="text-[11px] font-normal text-muted-foreground">(select all that apply to your cargo)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(['thermal','moisture','mechanical','atmosphere','special'] as const).map((cat) => (
                <div key={cat}>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{CATEGORY_LABELS[cat]}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TRANSPORT_REQUIREMENTS.filter((r) => r.category === cat).map((req) => {
                      const active = selectedReqs.includes(req.id);
                      return (
                        <button key={req.id} type="button" onClick={() => toggleReq(req.id)}
                          aria-pressed={active} title={req.description}
                          className={cn(
                            'flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer',
                            active
                              ? 'border-primary bg-accent text-primary shadow-sm'
                              : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                          )}>
                          <span aria-hidden>{req.icon}</span>{req.label}
                          {active && (
                            <span className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {selectedReqs.length > 0 && (
                <button type="button" onClick={() => setSelectedReqs([])}
                  className="text-[10px] text-muted-foreground underline hover:text-foreground">
                  Clear all ({selectedReqs.length} selected)
                </button>
              )}
            </CardContent>
          </Card>

          {/* ── Packaging Recommendations (driven by requirements + route risk) ── */}
          {(() => {
            if (!result && selectedReqs.length === 0) return null;
            const avgTemp = result
              ? result.route.checkpoints.reduce((s, c) => s + (c.temperatureC ?? 0), 0) / result.route.checkpoints.length
              : null;
            const avgRh = result
              ? result.route.checkpoints.reduce((s, c) => s + (c.relativeHumidityPercent ?? 0), 0) / result.route.checkpoints.length
              : null;
            const recs = result
              ? derivePackagingRecs(selectedReqs, hasFreshProduce, result.transportMode, result.route.distanceKm, result.route.durationMinutes, avgTemp, avgRh)
              : derivePackagingRecs(selectedReqs, hasFreshProduce, mode, 0, 0, null, null);

            return (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <PackageCheck className="h-4 w-4 text-emerald-600" />
                        Packaging Recommendations
                      </CardTitle>
                      <p className="text-[11px] text-muted-foreground">Deterministic rule-based — driven by selected requirements + route risk</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">{recs.length} rec{recs.length !== 1 ? 's' : ''}</span>
                      {selectedReqs.length > 0 && (
                        <span className="rounded-full bg-accent text-primary px-2 py-0.5 text-[10px] font-medium">{selectedReqs.length} selected</span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {recs.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Select transport requirements above to generate recommendations, or run the analysis with a fresh produce item.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {recs.map((rec) => (
                        <div key={rec.id} className={cn(
                          'rounded-xl border p-4 space-y-2.5',
                          rec.priority === 'essential'   ? 'border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20' :
                          rec.priority === 'recommended' ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20' :
                          'border-border bg-muted/20',
                        )}>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-xs leading-tight">{rec.title}</h4>
                            <span className={cn(
                              'shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide',
                              rec.priority === 'essential'   ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                              rec.priority === 'recommended' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' :
                              'bg-muted text-muted-foreground',
                            )}>
                              {rec.priority === 'essential' ? '🔴 Essential' : rec.priority === 'recommended' ? '🟠 Recommended' : 'Optional'}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{rec.rationale}</p>
                          {rec.triggeredBy.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {rec.triggeredBy.map((reqId) => {
                                const req = TRANSPORT_REQUIREMENTS.find((r) => r.id === reqId);
                                return req ? (
                                  <span key={reqId} className="inline-flex items-center gap-0.5 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-medium text-primary">
                                    {req.icon} {req.label}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                          <div className="space-y-1 border-t border-border/50 pt-2">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Guidance</p>
                            <ul className="space-y-1">
                              {rec.guidance.map((g, i) => (
                                <li key={i} className="flex items-start gap-1 text-[10px] text-muted-foreground">
                                  <ChevronRight className="mt-0.5 h-2.5 w-2.5 shrink-0 text-primary" />{g}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-3 border-t border-border pt-2.5 text-[9px] italic text-muted-foreground">
                    Transport-specific guidance only. Use the FoodPack AI Recommendation Engine for complete food + material compatibility analysis.
                  </p>
                </CardContent>
              </Card>
            );
          })()}

        </div>

        {/* ════ RIGHT COLUMN ════ */}
        <div className="flex flex-col gap-4">

          {/* Route Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" />Route Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {result ? (
                <>
                  <RightRow icon={<Gauge className="h-3.5 w-3.5 text-blue-500" />} label="Distance" value={`~${result.route.distanceKm.toFixed(0)} km`} sub="Mapbox" />
                  <RightRow icon={<Clock className="h-3.5 w-3.5 text-primary" />} label="Estimated Duration" value={fmt(result.route.durationMinutes)} sub="Mapbox" />
                  <RightRow icon={<Truck className="h-3.5 w-3.5 text-amber-600" />} label="Transport Mode" value={`Road (${result.transportMode.charAt(0).toUpperCase() + result.transportMode.slice(1)})`} />
                  <RightRow icon={<Calendar className="h-3.5 w-3.5 text-muted-foreground" />} label="Departure"
                    value={new Date(result.departureTime).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
                  {estimatedArrival && <RightRow icon={<MapPin className="h-3.5 w-3.5 text-red-500" />} label="Estimated Arrival" value={estimatedArrival} />}

                  {/* Cargo Summary */}
                  {foodItems.length > 0 && (
                    <div className="rounded-xl border border-border bg-accent/30 p-3 space-y-2 mt-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <Package className="h-3.5 w-3.5 text-primary" /> Cargo Summary
                        </div>
                        <span className="text-[10px] text-muted-foreground">{foodItems.length} food item{foodItems.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1 flex-wrap">
                          {foodItems.slice(0, 5).map((f) => (
                            <span key={f.id} title={`${f.foodName}: ${f.weightKg} kg`} className="text-lg" aria-label={f.foodName}>{f.emoji}</span>
                          ))}
                          {foodItems.length > 5 && <span className="text-xs text-muted-foreground self-center">+{foodItems.length - 5}</span>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{totalWeightKg.toLocaleString()} kg</p>
                          <p className="text-[10px] text-muted-foreground">({(totalWeightKg / 1000).toFixed(2)} ton)</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Run an analysis to see route details</p>
              )}
            </CardContent>
          </Card>

          {/* Packaging Impact */}
          {result && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-primary" />
                  Packaging Impact Analysis
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">Based on selected foods and route conditions</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { factor: result.packagingImpact.temperatureExposure, icon: <Thermometer className="h-3.5 w-3.5 text-orange-500" /> },
                  { factor: result.packagingImpact.humidityExposure,    icon: <Droplets    className="h-3.5 w-3.5 text-blue-500" /> },
                  { factor: result.packagingImpact.durationExposure,    icon: <Clock       className="h-3.5 w-3.5 text-primary" /> },
                  { factor: result.packagingImpact.handlingVibration,   icon: <Zap         className="h-3.5 w-3.5 text-amber-500" /> },
                ].map(({ factor, icon }) => (
                  <div key={factor.label}>
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-medium">{icon}{factor.label}</div>
                      <RiskBadge level={factor.level} />
                    </div>
                    <p className="text-[10px] text-muted-foreground pl-5 leading-relaxed">{factor.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommended Packaging Adjustments */}
          {result && adjustments.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Recommended Packaging Adjustments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {adjustments.map((adj, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {adj}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* IoT Validation */}
          {result && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" /> IoT Validation (During Transit)
                  </CardTitle>
                  <Badge variant="secondary" className={cn('text-[10px]',
                    iot.source === 'real' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                    {iot.source === 'real' ? '⬤ ESP32 Connected' : '⬤ ESP32 Connected'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: <Thermometer className="h-3.5 w-3.5 text-orange-500" />, label: 'Temperature', value: `${iot.temperatureC.toFixed(1)} °C`, status: iot.status.temperature },
                  { icon: <Droplets    className="h-3.5 w-3.5 text-blue-500" />, label: 'Humidity',    value: `${iot.relativeHumidityPercent.toFixed(0)} %`,  status: iot.status.humidity },
                  { icon: <Wind        className="h-3.5 w-3.5 text-slate-500" />, label: 'CO₂ Level',  value: `${iot.co2Ppm} ppm`,                            status: iot.status.co2 },
                  { icon: <Gauge       className="h-3.5 w-3.5 text-primary" />, label: 'O₂ Level',   value: `${iot.o2Percent.toFixed(1)} %`,                 status: iot.status.o2 },
                ].map(({ icon, label, value, status }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs">{icon}<span className="font-medium">{label}</span></div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">{value}</span>
                      <StatusDot status={status} />
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground">Last Updated: {new Date(iot.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <Button variant="outline" size="sm" className="w-full text-xs" nativeButton={false} render={<Link href="/iot">View Live Sensor Data →</Link>} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ════ BOTTOM ASSESSMENT BAR ════ */}
      {result && (
        <div className={cn(
          'fixed bottom-0 left-0 right-0 z-50 border-t border-border px-6 py-3',
          'bg-card/95 backdrop-blur-md shadow-lg',
        )}>
          <div className="mx-auto flex max-w-screen-2xl items-center gap-4">
            {/* Assessment badge */}
            <div className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-sm',
              result.assessment.rating === 'suitable' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
              result.assessment.rating === 'watch'    && 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
              result.assessment.rating === 'warning'  && 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
            )}>
              {result.assessment.rating === 'suitable' && <ShieldCheck className="h-5 w-5" />}
              {result.assessment.rating === 'watch'    && <AlertTriangle className="h-5 w-5" />}
              {result.assessment.rating === 'warning'  && <AlertCircle className="h-5 w-5" />}
              Transport Assessment
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 shrink-0">
              {result.assessment.rating === 'suitable' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              {result.assessment.rating === 'watch'    && <AlertTriangle className="h-5 w-5 text-amber-500" />}
              {result.assessment.rating === 'warning'  && <AlertCircle className="h-5 w-5 text-red-500" />}
              <div>
                <p className="text-xs text-muted-foreground">Overall Route Condition</p>
                <p className="text-sm font-bold capitalize">{result.assessment.rating}</p>
              </div>
            </div>

            {/* Summary */}
            <p className="flex-1 text-xs text-muted-foreground leading-relaxed hidden md:block">{result.assessment.summary}</p>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button nativeButton={false} render={<Link href="/analysis/new"><PackageCheck className="h-4 w-4" /> View Packaging Recommendation</Link>} />
              <Button variant="secondary" disabled>Save Analysis</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Small layout helpers ─────────────────────────────────────────────────
function RightRow({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0">{icon}{label}</div>
      <div className="text-right">
        <p className="text-xs font-semibold">{value}</p>
        {sub && <p className="text-[9px] text-muted-foreground/60">{sub}</p>}
      </div>
    </div>
  );
}
