'use client';

/**
 * QuestionBlock
 *
 * A generic renderer for a single QuestionDef from the questionnaire template
 * engine. Renders the appropriate input UI based on `question.type`.
 *
 * This component has NO food-specific logic. It only renders what the template
 * system provides, keeping all category/food intelligence in the template layer.
 */

import {
  AlertTriangle,
  Archive,
  Box,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Coins,
  Cookie,
  Droplets,
  Flame,
  FlaskConical,
  Globe2,
  Layers,
  Leaf,
  MapPin,
  Package,
  PackageCheck,
  Recycle,
  Scale,
  Scissors,
  Snowflake,
  Sparkles,
  Square,
  Sun,
  Thermometer,
  Ticket,
  TreeDeciduous,
  Truck,
  Wallet,
  Wind,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { OptionPicker } from '@/components/wizard/option-picker';
import { cn } from '@/lib/utils';
import type { QuestionDef } from '@/lib/questionnaire/types';

// ─── Icon registry ────────────────────────────────────────────────────────────
// Map icon name strings from templates to actual Lucide components so templates
// can be serialised without importing React components.

const ICON_MAP: Record<string, LucideIcon> = {
  AlertTriangle,
  Archive,
  Box,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Coins,
  Cookie,
  Droplets,
  Flame,
  FlaskConical,
  Globe2,
  Layers,
  Leaf,
  MapPin,
  Package,
  PackageCheck,
  Recycle,
  Scale,
  Scissors,
  Snowflake,
  Sparkles,
  Square,
  Sun,
  Thermometer,
  Ticket,
  TreeDeciduous,
  Truck,
  Wallet,
  Wind,
  Cup: FlaskConical,     // alias
};

// ─── Shelf-life preset helper ─────────────────────────────────────────────────

const SHELF_LIFE_PRESETS = [
  { label: '< 3 days', days: 2 },
  { label: '3–7 days', days: 5 },
  { label: '1–2 weeks', days: 10 },
  { label: '2–4 weeks', days: 21 },
  { label: '1–3 months', days: 60 },
  { label: '3–6 months', days: 120 },
  { label: '6–12 months', days: 270 },
  { label: '12+ months', days: 400 },
];

const PACK_WEIGHT_PRESETS = [
  { label: '250 g', sublabel: 'Small retail', kg: 0.25 },
  { label: '500 g', sublabel: 'Retail', kg: 0.5 },
  { label: '1 kg', sublabel: 'Retail pack', kg: 1 },
  { label: '5 kg', sublabel: 'Retail/wholesale', kg: 5 },
  { label: '10 kg', sublabel: 'Bulk retail', kg: 10 },
  { label: '25 kg', sublabel: 'Sack / carton', kg: 25 },
  { label: '50 kg', sublabel: 'Sack', kg: 50 },
  { label: '500 kg', sublabel: 'Bulk bag', kg: 500 },
  { label: '2000+ kg', sublabel: 'Bulk / truckload', kg: 2000 },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface QuestionBlockProps {
  question: QuestionDef;
  /** Current raw value (string for single_select; number for shelf_life / pack_weight) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuestionBlock({ question, value, onChange }: QuestionBlockProps) {
  return (
    <div className="space-y-2">
      {/* Label + help text */}
      <div>
        <p className="text-sm font-semibold tracking-tight">{question.question}</p>
        {question.helpText && (
          <p className="mt-0.5 text-xs text-muted-foreground">{question.helpText}</p>
        )}
      </div>

      {/* Input by type */}
      {question.type === 'single_select' && question.options && (
        <OptionPicker
          columns={question.columns ?? 3}
          value={value as string | undefined}
          onChange={onChange}
          options={question.options.map((opt) => ({
            value: opt.value,
            label: opt.label,
            description: opt.sublabel,
            icon: opt.icon ? ICON_MAP[opt.icon] : undefined,
          }))}
        />
      )}

      {question.type === 'shelf_life' && (
        <ShelfLifePicker value={value as number} onChange={onChange} />
      )}

      {question.type === 'pack_weight' && (
        <PackWeightPicker value={value as number} onChange={onChange} />
      )}

      {question.type === 'info_hint' && question.note && (
        <div className="rounded-xl border border-dashed border-primary/30 bg-accent/50 px-4 py-3 text-sm text-accent-foreground">
          {question.note}
        </div>
      )}
    </div>
  );
}

// ─── Sub-inputs ───────────────────────────────────────────────────────────────

function ShelfLifePicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {SHELF_LIFE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange(preset.days)}
            className={cn(
              'rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors',
              value === preset.days
                ? 'border-primary bg-accent text-accent-foreground ring-1 ring-primary'
                : 'border-border bg-card hover:bg-secondary/40',
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Or enter exact days:</span>
        <Input
          type="number"
          min={1}
          max={730}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 1)}
          className="h-8 w-24"
        />
      </div>
    </div>
  );
}

function PackWeightPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {PACK_WEIGHT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange(preset.kg)}
            className={cn(
              'rounded-xl border px-3 py-2.5 text-left transition-colors',
              value === preset.kg
                ? 'border-primary bg-accent text-accent-foreground ring-1 ring-primary'
                : 'border-border bg-card hover:bg-secondary/40',
            )}
          >
            <span className="block text-sm font-medium">{preset.label}</span>
            <span className="block text-xs text-muted-foreground">{preset.sublabel}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Or exact weight (kg):</span>
        <Input
          type="number"
          min={0.1}
          max={25000}
          step={0.1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0.1)}
          className="h-8 w-28"
        />
      </div>
    </div>
  );
}
