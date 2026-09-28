'use client';

/**
 * Transport Dashboard — Main Client Component
 *
 * Orchestrates the full Transport Analysis UI:
 *  - Route input form (Mapbox geocoding, mode selector, food picker)
 *  - Mapbox interactive map
 *  - Route summary card
 *  - Expected environmental conditions (Open-Meteo)
 *  - Packaging impact analysis (rule-based engine)
 *  - IoT validation during transit (ESP32 simulated)
 *  - Transport assessment
 *  - Recent routes
 *
 * Data source labels are always shown alongside every value.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Truck, Train, Plane, Ship, MapPin, Calendar, Leaf, ArrowRight,
  RefreshCw, AlertTriangle, CheckCircle2, Info, Thermometer,
  Droplets, CloudRain, Wind, Clock, Navigation, Gauge, Zap,
  Activity, ExternalLink, ChevronRight, ShieldCheck, AlertCircle,
  BarChart3, PackageCheck, History,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  AssessmentRating,
  RouteCheckpoint,
} from '@/lib/transport/types';

// ─── Constants ────────────────────────────────────────────────────────────
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

const TRANSPORT_MODES: { id: TransportMode; label: string; icon: React.ReactNode }[] = [
  { id: 'road', label: 'Road', icon: <Truck className="h-5 w-5" /> },
  { id: 'rail', label: 'Rail', icon: <Train className="h-5 w-5" /> },
  { id: 'air', label: 'Air', icon: <Plane className="h-5 w-5" /> },
  { id: 'sea', label: 'Sea', icon: <Ship className="h-5 w-5" /> },
];

const STEP_LABELS: Record<AnalysisStep, string> = {
  idle: '',
  geocoding: 'Geocoding locations…',
  routing: 'Calculating route…',
  weather: 'Loading environmental forecast…',
  evaluating: 'Evaluating transport impact…',
  complete: 'Analysis complete',
  error: 'Analysis failed',
};

const DEMO_ROUTES = [
  { from: 'Chennai, Tamil Nadu', to: 'Bengaluru, Karnataka', distance: '~350 km', duration: '7h 30min', date: '28 Sep 2026' },
  { from: 'Coimbatore, Tamil Nadu', to: 'Chennai, Tamil Nadu', distance: '~500 km', duration: '9h 20min', date: '25 Sep 2026' },
  { from: 'Mumbai, Maharashtra', to: 'Pune, Maharashtra', distance: '~150 km', duration: '4h', date: '20 Sep 2026' },
];

// ─── Mock/Instant Result Builder ─────────────────────────────────────────
// Generates a plausible result immediately from inputs so the UI
// renders something meaningful while real API calls complete.
function buildMockResult(
  src: GeoLocation,
  dst: GeoLocation,
  transportMode: TransportMode,
  departureTime: string,
  foodSlug: string,
  foodName: string,
  isFreshProduce: boolean,
): import('@/lib/transport/types').TransportAnalysisResult {
  // Haversine-based rough distance
  const R = 6371;
  const dLat = ((dst.latitude - src.latitude) * Math.PI) / 180;
  const dLon = ((dst.longitude - src.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((src.latitude * Math.PI) / 180) *
      Math.cos((dst.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const distKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  const speedMap: Record<TransportMode, number> = { road: 60, rail: 80, air: 800, sea: 30 };
  const durationMins = Math.round((distKm / speedMap[transportMode]) * 60);
  const dep = new Date(departureTime);

  // Realistic simulated temperature band based on rough latitude
  const baseTemp = 26 + (src.latitude < 15 ? 5 : 2);

  const checkpointNames = [src.name, 'Checkpoint 1', 'Checkpoint 2', dst.name];
  const checkpoints: import('@/lib/transport/types').RouteCheckpoint[] = checkpointNames.map(
    (name, i) => {
      const frac = i / (checkpointNames.length - 1);
      const lat = src.latitude + (dst.latitude - src.latitude) * frac;
      const lon = src.longitude + (dst.longitude - src.longitude) * frac;
      const arrival = new Date(dep.getTime() + frac * durationMins * 60_000);
      const rng = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
      return {
        name,
        latitude: lat,
        longitude: lon,
        distanceFromSourceKm: Math.round(frac * distKm),
        estimatedArrival: arrival.toISOString(),
        weatherDataSource: 'Simulated' as const,
        temperatureC: parseFloat((baseTemp + rng(-2, 6)).toFixed(1)),
        relativeHumidityPercent: parseFloat(rng(45, 82).toFixed(0)),
        precipitationProbabilityPercent: Math.round(rng(5, 45)),
        windSpeedKmh: parseFloat(rng(6, 20).toFixed(0)),
      };
    },
  );

  // Straight-line geometry
  const geometry: [number, number][] = Array.from({ length: 20 }, (_, i) => [
    src.longitude + ((dst.longitude - src.longitude) * i) / 19,
    src.latitude + ((dst.latitude - src.latitude) * i) / 19,
  ]);

  const impact = evaluateTransportRisk({ checkpoints, durationMinutes: durationMins, distanceKm: distKm, mode: transportMode, isFreshProduce });
  const assessment = evaluateAssessment(impact);
  const iotSnapshot = getIoTSnapshot();

  return {
    id: crypto.randomUUID(),
    source: src,
    destination: dst,
    transportMode,
    departureTime,
    foodSlug: foodSlug || undefined,
    foodName: foodName || undefined,
    isFreshProduce,
    route: { distanceKm: distKm, durationMinutes: durationMins, geometry, checkpoints, routingMethod: 'estimated' },
    packagingImpact: impact,
    iotValidation: iotSnapshot,
    assessment,
    createdAt: new Date().toISOString(),
  };
}


// ─── Helper Components ────────────────────────────────────────────────────

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        level === 'low' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
        level === 'moderate' && 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
        level === 'high' && 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
      )}
    >
      {level === 'low' && <CheckCircle2 className="h-3 w-3" />}
      {level === 'moderate' && <AlertTriangle className="h-3 w-3" />}
      {level === 'high' && <AlertCircle className="h-3 w-3" />}
      {level === 'low' ? 'Low risk' : level === 'moderate' ? 'Moderate risk' : 'High risk'}
    </span>
  );
}

function StatusDot({ status }: { status: 'normal' | 'watch' | 'warning' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
        status === 'normal' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
        status === 'watch' && 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
        status === 'warning' && 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
      )}
    >
      {status === 'normal' ? '🟢 Normal' : status === 'watch' ? '🟠 Watch' : '🔴 Warning'}
    </span>
  );
}

function AssessmentBadge({ rating }: { rating: AssessmentRating }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-semibold',
        rating === 'suitable' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
        rating === 'watch' && 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
        rating === 'warning' && 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
      )}
    >
      {rating === 'suitable' && <ShieldCheck className="h-4 w-4" />}
      {rating === 'watch' && <AlertTriangle className="h-4 w-4" />}
      {rating === 'warning' && <AlertCircle className="h-4 w-4" />}
      {rating === 'suitable' ? 'Suitable' : rating === 'watch' ? 'Watch' : 'Warning'}
    </span>
  );
}

// ─── Location Search Input ────────────────────────────────────────────────

function LocationInput({
  label,
  icon,
  value,
  onChange,
  onSelect,
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  onSelect: (s: GeocodingSuggestion) => void;
  placeholder: string;
}) {
  const [suggestions, setSuggestions] = useState<GeocodingSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleChange = (v: string) => {
    onChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await geocodeLocation(v);
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }, 350);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary">
          {icon}
        </div>
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-9"
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          aria-label={label}
          aria-autocomplete="list"
          aria-expanded={open}
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(''); setSuggestions([]); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear"
          >
            ×
          </button>
        )}
        {loading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
          </div>
        )}

        {open && suggestions.length > 0 && (
          <ul
            className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg"
            role="listbox"
          >
            {suggestions.map((s) => (
              <li
                key={s.id}
                role="option"
                aria-selected={false}
                onMouseDown={() => { onSelect(s); onChange(s.name); setOpen(false); setSuggestions([]); }}
                className="flex cursor-pointer items-start gap-2 px-3 py-2.5 text-sm hover:bg-accent/50"
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="font-medium leading-tight truncate">{s.name}</p>
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

// ─── Mapbox Map Component ─────────────────────────────────────────────────

function TransportMap({
  source,
  destination,
  geometry,
  checkpoints,
}: {
  source?: GeoLocation;
  destination?: GeoLocation;
  geometry?: [number, number][];
  checkpoints?: RouteCheckpoint[];
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const [mapError, setMapError] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    if (!MAPBOX_TOKEN) { setMapError(true); return; }

    const initMap = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const center: [number, number] = source && destination
          ? [(source.longitude + destination.longitude) / 2, (source.latitude + destination.latitude) / 2]
          : [80.27, 13.08]; // Chennai default

        const map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center,
          zoom: source && destination ? 6 : 5,
          attributionControl: false,
        });

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

        map.on('load', () => {
          setMapLoaded(true);

          // Add route line
          if (geometry && geometry.length > 1) {
            map.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: { type: 'LineString', coordinates: geometry },
              },
            });
            map.addLayer({
              id: 'route-line',
              type: 'line',
              source: 'route',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#2563eb', 'line-width': 3, 'line-opacity': 0.8 },
            });
          }

          // Source marker
          if (source) {
            const el = document.createElement('div');
            el.className = 'transport-marker-source';
            el.style.cssText = 'width:14px;height:14px;border-radius:50%;background:#15803d;border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)';
            new mapboxgl.Marker({ element: el })
              .setLngLat([source.longitude, source.latitude])
              .setPopup(new mapboxgl.Popup({ offset: 16 }).setHTML(`<strong>Source</strong><br/>${source.name}`))
              .addTo(map);
          }

          // Destination marker
          if (destination) {
            const el = document.createElement('div');
            el.style.cssText = 'width:14px;height:14px;border-radius:50%;background:#dc2626;border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)';
            new mapboxgl.Marker({ element: el })
              .setLngLat([destination.longitude, destination.latitude])
              .setPopup(new mapboxgl.Popup({ offset: 16 }).setHTML(`<strong>Destination</strong><br/>${destination.name}`))
              .addTo(map);
          }

          // Intermediate checkpoint markers
          if (checkpoints && checkpoints.length > 2) {
            checkpoints.slice(1, -1).forEach((cp) => {
              const el = document.createElement('div');
              el.style.cssText = 'width:10px;height:10px;border-radius:50%;background:#2563eb;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.2)';
              new mapboxgl.Marker({ element: el })
                .setLngLat([cp.longitude, cp.latitude])
                .addTo(map);
            });
          }

          // Fit bounds to route
          if (source && destination) {
            map.fitBounds(
              [[
                Math.min(source.longitude, destination.longitude) - 0.5,
                Math.min(source.latitude, destination.latitude) - 0.5,
              ], [
                Math.max(source.longitude, destination.longitude) + 0.5,
                Math.max(source.latitude, destination.latitude) + 0.5,
              ]],
              { padding: 40, duration: 1000 },
            );
          }
        });

        mapRef.current = map;
      } catch (err) {
        console.error('Map init error:', err);
        setMapError(true);
      }
    };

    initMap();
    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map when route data changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Remove old layers
    ['route-line'].forEach((id) => { if (map.getLayer(id)) map.removeLayer(id); });
    ['route'].forEach((id) => { if (map.getSource(id)) map.removeSource(id); });

    // Re-add route
    if (geometry && geometry.length > 1) {
      map.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: geometry } },
      });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#2563eb', 'line-width': 3, 'line-opacity': 0.8 },
      });
    }
  }, [geometry, mapLoaded]);

  if (mapError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl bg-muted/40 p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <p className="font-medium">Map service is temporarily unavailable.</p>
        <p className="text-sm text-muted-foreground">Route analysis can continue using calculated data.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full rounded-xl overflow-hidden border border-border">
      <div ref={mapContainerRef} className="h-full w-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      {/* Legend */}
      <div className="absolute top-3 right-3 rounded-lg bg-card/90 backdrop-blur px-3 py-2 text-xs border border-border shadow-sm space-y-1">
        <div className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-blue-500 inline-block" />Route</div>
        {source && <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary inline-block" />Source ({source.name})</div>}
        {destination && <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" />Destination ({destination.name})</div>}
        <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400 inline-block" />Key Stop</div>
      </div>
    </div>
  );
}

// ─── Checkpoint Environmental Card ────────────────────────────────────────

function CheckpointCard({ cp, idx }: { cp: RouteCheckpoint; idx: number }) {
  const isDemo = cp.weatherDataSource !== 'Open-Meteo';
  const arrivalTime = new Date(cp.estimatedArrival).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="flex-1 min-w-[160px] rounded-xl border border-border bg-card p-3 space-y-3">
      <div>
        <p className="font-semibold text-sm truncate">{cp.name}</p>
        <p className="text-[11px] text-muted-foreground">{cp.distanceFromSourceKm} km · {arrivalTime}</p>
        {isDemo && (
          <Badge variant="secondary" className="mt-1 text-[9px] py-0">Simulated</Badge>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Thermometer className="h-3.5 w-3.5 text-orange-500" aria-hidden />
          <div>
            <p className="font-semibold">{cp.temperatureC !== null ? `${cp.temperatureC.toFixed(1)}°C` : '—'}</p>
            <p className="text-[10px] text-muted-foreground">Temp</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Droplets className="h-3.5 w-3.5 text-blue-500" aria-hidden />
          <div>
            <p className="font-semibold">{cp.relativeHumidityPercent !== null ? `${Math.round(cp.relativeHumidityPercent)}%` : '—'}</p>
            <p className="text-[10px] text-muted-foreground">Humidity</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <CloudRain className="h-3.5 w-3.5 text-sky-500" aria-hidden />
          <div>
            <p className="font-semibold">{cp.precipitationProbabilityPercent !== null ? `${Math.round(cp.precipitationProbabilityPercent)}%` : '—'}</p>
            <p className="text-[10px] text-muted-foreground">Rain</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className="h-3.5 w-3.5 text-slate-500" aria-hidden />
          <div>
            <p className="font-semibold">{cp.windSpeedKmh !== null ? `${Math.round(cp.windSpeedKmh)} km/h` : '—'}</p>
            <p className="text-[10px] text-muted-foreground">Wind</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────

export function TransportDashboard() {
  // ── Form state
  const [sourceText, setSourceText] = useState('');
  const [destText, setDestText] = useState('');
  const [source, setSource] = useState<GeoLocation | null>(null);
  const [destination, setDestination] = useState<GeoLocation | null>(null);
  const [mode, setMode] = useState<TransportMode>('road');
  const [departureTime, setDepartureTime] = useState(() => {
    const d = new Date();
    d.setHours(8, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [foodSearch, setFoodSearch] = useState('');
  const [selectedFoodSlug, setSelectedFoodSlug] = useState<string>('');
  const [selectedFoodName, setSelectedFoodName] = useState<string>('');
  const [isFreshProduce, setIsFreshProduce] = useState(false);

  // ── Analysis state
  const [step, setStep] = useState<AnalysisStep>('idle');
  const [result, setResult] = useState<TransportAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // ── IoT live tick
  const [iot, setIot] = useState(() => getIoTSnapshot());
  useEffect(() => {
    const id = setInterval(() => setIot(getIoTSnapshot()), 5000);
    return () => clearInterval(id);
  }, []);

  // ── Food search
  const { data: foods } = useFoods({ search: foodSearch });
  const [foodOpen, setFoodOpen] = useState(false);

  // ── Run analysis — show mock immediately, then refine with real API data
  const runAnalysis = useCallback(async () => {
    if (!source || !destination) { setErrorMsg('Please select both source and destination.'); return; }
    setErrorMsg('');
    setStep('geocoding');

    // ── Step 1: Immediately show mock data so UI is populated instantly
    const mockResult = buildMockResult(
      source, destination, mode, departureTime,
      selectedFoodSlug, selectedFoodName, isFreshProduce,
    );
    setResult(mockResult);
    setIsRefining(true);

    try {
      // ── Step 2: Real Mapbox route
      setStep('routing');
      const route = await getRoute(source, destination, mode, departureTime);

      // ── Step 3: Real Open-Meteo weather
      setStep('weather');
      const enrichedCheckpoints = await enrichCheckpointsWithWeather(route.checkpoints);

      // ── Step 4: Re-evaluate with real data
      setStep('evaluating');
      const enrichedRoute = { ...route, checkpoints: enrichedCheckpoints };
      const impact = evaluateTransportRisk({
        checkpoints: enrichedCheckpoints,
        durationMinutes: route.durationMinutes,
        distanceKm: route.distanceKm,
        mode,
        isFreshProduce,
      });
      const assessment = evaluateAssessment(impact);
      const iotSnapshot = getIoTSnapshot();

      const finalResult: TransportAnalysisResult = {
        id: crypto.randomUUID(),
        source,
        destination,
        transportMode: mode,
        departureTime,
        foodSlug: selectedFoodSlug || undefined,
        foodName: selectedFoodName || undefined,
        isFreshProduce,
        route: enrichedRoute,
        packagingImpact: impact,
        iotValidation: iotSnapshot,
        assessment,
        createdAt: new Date().toISOString(),
      };

      setResult(finalResult);
      setStep('complete');
    } catch (err) {
      console.error(err);
      // Keep the mock result visible even on API failure
      setStep('complete');
      setErrorMsg('Some live data could not be loaded. Results shown with estimated values.');
    } finally {
      setIsRefining(false);
    }
  }, [source, destination, mode, departureTime, isFreshProduce, selectedFoodSlug, selectedFoodName]);


  const isRunning = step !== 'idle' && step !== 'complete' && step !== 'error';
  const canAnalyse = !!source && !!destination && !isRunning;

  // ── Duration formatter
  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="space-y-5">
      {/* ── ROW 1: Input + Map + Summary ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr_260px]">

        {/* Route Details — overflow-visible so suggestion dropdowns render outside the card */}
        <Card className="flex flex-col overflow-visible">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Route Details</CardTitle>
            <p className="text-xs text-muted-foreground">Enter source, destination and transport details</p>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 gap-4">
            {/* From */}
            <LocationInput
              label="From (Source)"
              icon={<MapPin className="h-4 w-4 text-primary" />}
              value={sourceText}
              onChange={setSourceText}
              onSelect={(s) => setSource({ name: s.name, latitude: s.latitude, longitude: s.longitude, fullName: s.fullName })}
              placeholder="Search location…"
            />

            {/* To */}
            <LocationInput
              label="To (Destination)"
              icon={<MapPin className="h-4 w-4 text-red-500" />}
              value={destText}
              onChange={setDestText}
              onSelect={(s) => setDestination({ name: s.name, latitude: s.latitude, longitude: s.longitude, fullName: s.fullName })}
              placeholder="Search location…"
            />

            {/* Transport Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Transport Mode</label>
              <div className="grid grid-cols-4 gap-1.5">
                {TRANSPORT_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    aria-pressed={mode === m.id}
                    aria-label={m.label}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-medium transition-all',
                      mode === m.id
                        ? 'border-primary bg-accent text-primary'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-accent/40',
                    )}
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>
              {mode !== 'road' && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400">
                  ⚠ {mode.charAt(0).toUpperCase() + mode.slice(1)} routing uses estimated distance — Mapbox road profile only available for road transport.
                </p>
              )}
            </div>

            {/* Departure */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="departure-dt">
                Departure Date &amp; Time
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="departure-dt"
                  type="datetime-local"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Departure date and time"
                />
              </div>
            </div>

            {/* Food Commodity */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Food Commodity (Optional)</label>
              <div className="relative">
                <Leaf className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                <Input
                  value={selectedFoodName || foodSearch}
                  onChange={(e) => {
                    setFoodSearch(e.target.value);
                    if (!e.target.value) { setSelectedFoodSlug(''); setSelectedFoodName(''); }
                    setFoodOpen(true);
                  }}
                  onFocus={() => setFoodOpen(true)}
                  onBlur={() => setTimeout(() => setFoodOpen(false), 150)}
                  placeholder="Search food…"
                  className="pl-9 pr-9"
                  aria-label="Food commodity"
                />
                {selectedFoodName && (
                  <button
                    type="button"
                    onClick={() => { setSelectedFoodSlug(''); setSelectedFoodName(''); setFoodSearch(''); setIsFreshProduce(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear food selection"
                  >
                    ×
                  </button>
                )}
                {foodOpen && foods?.items && foods.items.length > 0 && !selectedFoodName && (
                  <ul className="absolute left-0 top-full z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
                    {foods.items.slice(0, 8).map((f) => (
                      <li
                        key={f.id}
                        onMouseDown={() => {
                          setSelectedFoodSlug(f.slug);
                          setSelectedFoodName(f.name);
                          setIsFreshProduce(f.isFreshProduce);
                          setFoodSearch('');
                          setFoodOpen(false);
                        }}
                        className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-accent/50"
                      >
                        <Leaf className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span>{f.name}</span>
                        {f.isFreshProduce && <Badge variant="secondary" className="ml-auto text-[9px] py-0">Fresh</Badge>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Error */}
            {(step === 'error' || errorMsg) && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-700 dark:text-red-400">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{errorMsg || 'Analysis failed. Please retry.'}</p>
              </div>
            )}

            {/* Visual progress stepper */}
            {isRunning && (
              <div className="space-y-2 rounded-xl border border-primary/20 bg-accent/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Analysing route…</p>
                {([
                  { id: 'geocoding', label: 'Geocoding locations', icon: <MapPin className="h-3 w-3" /> },
                  { id: 'routing',   label: 'Calculating route',   icon: <Navigation className="h-3 w-3" /> },
                  { id: 'weather',   label: 'Fetching forecast',   icon: <CloudRain className="h-3 w-3" /> },
                  { id: 'evaluating',label: 'Evaluating impact',   icon: <PackageCheck className="h-3 w-3" /> },
                ] as const).map((s) => {
                  const steps: AnalysisStep[] = ['geocoding','routing','weather','evaluating','complete'];
                  const currentIdx = steps.indexOf(step);
                  const thisIdx = steps.indexOf(s.id);
                  const isDone = thisIdx < currentIdx;
                  const isActive = thisIdx === currentIdx;
                  return (
                    <div key={s.id} className={cn(
                      'flex items-center gap-2 text-[11px] transition-all',
                      isDone ? 'text-primary' : isActive ? 'text-foreground' : 'text-muted-foreground/50',
                    )}>
                      <span className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                        isDone ? 'border-primary bg-primary text-primary-foreground' :
                        isActive ? 'border-primary bg-accent text-primary animate-pulse' :
                        'border-border bg-muted/30',
                      )}>
                        {isDone ? <CheckCircle2 className="h-3 w-3" /> : s.icon}
                      </span>
                      <span className={isActive ? 'font-semibold' : ''}>{s.label}</span>
                      {isActive && <RefreshCw className="ml-auto h-3 w-3 animate-spin text-primary" />}
                      {isDone && <CheckCircle2 className="ml-auto h-3 w-3 text-primary" />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Analyse button */}
            <Button
              onClick={runAnalysis}
              disabled={!canAnalyse}
              className="mt-auto w-full"
              aria-label="Analyse transport route"
            >
              {isRunning ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Analysing…</>
              ) : (
                <>Analyse Transport Route <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>

          </CardContent>
        </Card>

        {/* Map */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              Route Map
              {result?.route.routingMethod === 'estimated' && (
                <Badge variant="secondary" className="text-[10px]">Planned / Estimated</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[400px] lg:h-[460px]">
            <div className="h-full p-3 pt-0">
              <TransportMap
                source={result?.source ?? (source ?? undefined)}
                destination={result?.destination ?? (destination ?? undefined)}
                geometry={result?.route.geometry}
                checkpoints={result?.route.checkpoints}
              />
            </div>
          </CardContent>
        </Card>

        {/* Route Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Route Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {result ? (
              <>
                <SummaryRow icon={<Gauge className="h-4 w-4 text-blue-500" />} label="Distance" value={`~${result.route.distanceKm.toFixed(0)} km`} source="Mapbox" />
                <SummaryRow icon={<Clock className="h-4 w-4 text-primary" />} label="Estimated Duration" value={formatDuration(result.route.durationMinutes)} source="Mapbox" />
                <SummaryRow
                  icon={<Truck className="h-4 w-4 text-amber-600" />}
                  label="Transport Mode"
                  value={result.transportMode.charAt(0).toUpperCase() + result.transportMode.slice(1)}
                />
                <SummaryRow icon={<Calendar className="h-4 w-4 text-muted-foreground" />} label="Departure" value={formatDate(result.departureTime)} />
                <SummaryRow
                  icon={<MapPin className="h-4 w-4 text-red-500" />}
                  label="Key Route"
                  value={result.route.checkpoints.map((c) => c.name).join(' → ')}
                  small
                />
                {result.foodName && (
                  <SummaryRow icon={<Leaf className="h-4 w-4 text-primary" />} label="Food Commodity" value={result.foodName} source="Food KB" />
                )}
              </>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
                <p className="text-center text-xs text-muted-foreground pt-4">Run an analysis to see route details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Refining banner — shown while mock is displayed + real API is loading ── */}
      {result && isRefining && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-accent/50 px-4 py-3 text-sm">
          <RefreshCw className="h-4 w-4 animate-spin text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-primary">Refining results with live data…</p>
            <p className="text-xs text-muted-foreground">Estimated values are shown. Map route and weather forecast are loading in the background.</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Simulated data active
          </div>
        </div>
      )}

      {/* ── ROW 2: Environmental Conditions (only after analysis) ─────── */}
      {result && (

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <CloudRain className="h-4 w-4 text-sky-500" />
                  Expected Environmental Conditions
                </CardTitle>
                <p className="text-xs text-muted-foreground">Forecast conditions along the planned route.</p>
              </div>
              <a
                href="https://open-meteo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Weather data from Open-Meteo (opens in new tab)"
              >
                <Info className="h-3 w-3" />
                Weather data: Open-Meteo
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-[11px] italic text-muted-foreground">
              Expected external environmental conditions — not actual package conditions.
            </p>
            <div className="flex flex-wrap gap-3">
              {result.route.checkpoints.map((cp, idx) => (
                <CheckpointCard key={idx} cp={cp} idx={idx} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── ROW 3: Impact + Adjustments + IoT ────────────────────────── */}
      {result && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* Packaging Impact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-primary" />
                Packaging Impact Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { factor: result.packagingImpact.temperatureExposure, icon: <Thermometer className="h-4 w-4 text-orange-500" /> },
                { factor: result.packagingImpact.humidityExposure, icon: <Droplets className="h-4 w-4 text-blue-500" /> },
                { factor: result.packagingImpact.durationExposure, icon: <Clock className="h-4 w-4 text-primary" /> },
                { factor: result.packagingImpact.handlingVibration, icon: <Zap className="h-4 w-4 text-amber-500" /> },
              ].map(({ factor, icon }) => (
                <div key={factor.label} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {icon}
                      {factor.label}
                    </div>
                    <RiskBadge level={factor.level} />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">{factor.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Packaging Adjustments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-emerald-600" />
                Recommended Packaging Adjustments
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Transport-driven implications. Final material selection requires the Recommendation Engine.
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {result.packagingImpact.adjustments.map((adj, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{adj}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* IoT Validation */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  IoT Monitoring (During Transit)
                </CardTitle>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-[10px]',
                    iot.source === 'real'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
                  )}
                >
                  {iot.source === 'real' ? '⬤ ESP32 Connected' : '⬤ Simulated Demo Data'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <IotRow
                icon={<Thermometer className="h-4 w-4 text-orange-500" />}
                label="Temperature"
                value={`${iot.temperatureC.toFixed(1)} °C`}
                status={iot.status.temperature}
                expected={result ? `Expected: ${result.route.checkpoints[0]?.temperatureC?.toFixed(0) ?? '?'}–${result.route.checkpoints[result.route.checkpoints.length - 1]?.temperatureC?.toFixed(0) ?? '?'}°C` : undefined}
              />
              <IotRow
                icon={<Droplets className="h-4 w-4 text-blue-500" />}
                label="Humidity"
                value={`${iot.relativeHumidityPercent.toFixed(0)} %`}
                status={iot.status.humidity}
              />
              <IotRow
                icon={<Wind className="h-4 w-4 text-slate-500" />}
                label="CO₂ Level"
                value={`${iot.co2Ppm} ppm`}
                status={iot.status.co2}
              />
              <IotRow
                icon={<Gauge className="h-4 w-4 text-primary" />}
                label="O₂ Level"
                value={`${iot.o2Percent.toFixed(1)} %`}
                status={iot.status.o2}
              />
              <p className="text-[10px] text-muted-foreground">
                Last updated: {new Date(iot.timestamp).toLocaleTimeString('en-IN')}
              </p>
              {iot.source === 'simulated' && (
                <p className="text-[10px] italic text-amber-600 dark:text-amber-400">
                  Showing simulated demo readings — no live ESP32 connected in transport context.
                </p>
              )}
              <Button variant="outline" size="sm" className="w-full text-xs mt-1" nativeButton={false} render={<Link href="/iot">View Live Sensor Data →</Link>} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── ROW 4: Transport Assessment ───────────────────────────────── */}
      {result && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Transport Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <AssessmentBadge rating={result.assessment.rating} />
              <p className="text-sm text-muted-foreground">Overall Route Condition</p>
            </div>
            <p className="text-sm">{result.assessment.summary}</p>
            <ul className="space-y-1.5">
              {result.assessment.details.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {d}
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-3 border-t border-border">
              <Button variant="outline" nativeButton={false} render={<Link href="/analysis/new"><PackageCheck className="h-4 w-4" />View Packaging Recommendation</Link>} />
              <Button variant="secondary" disabled>
                Save Analysis
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setResult(null); setStep('idle'); }}
              >
                Back to Transport Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Recent Routes ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            Recent Routes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {DEMO_ROUTES.map((r, i) => (
              <button
                key={i}
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-left text-sm hover:bg-accent/40 transition-colors group"
                onClick={() => {
                  setSourceText(r.from.split(',')[0]);
                  setDestText(r.to.split(',')[0]);
                }}
                aria-label={`Load recent route from ${r.from} to ${r.to}`}
              >
                <Truck className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{r.from} → {r.to}</p>
                  <p className="text-[11px] text-muted-foreground">{r.distance} · {r.duration}</p>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">{r.date}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Small helper sub-components ─────────────────────────────────────────

function SummaryRow({
  icon, label, value, source, small,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  source?: string;
  small?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
        {icon}
        {label}
      </div>
      <div className="text-right">
        <p className={cn('font-semibold', small ? 'text-[11px] leading-tight text-muted-foreground' : 'text-sm')}>{value}</p>
        {source && <p className="text-[9px] text-muted-foreground/70">{source}</p>}
      </div>
    </div>
  );
}

function IotRow({
  icon, label, value, status, expected,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status: 'normal' | 'watch' | 'warning';
  expected?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <div>
          <span className="font-medium">{label}</span>
          {expected && <p className="text-[10px] text-muted-foreground">{expected}</p>}
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">{value}</p>
        <StatusDot status={status} />
      </div>
    </div>
  );
}
