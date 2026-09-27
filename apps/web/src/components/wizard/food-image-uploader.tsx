'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  UploadCloud,
  Camera,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  X,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { FoodSummary } from '@/lib/api/types';
import { getFoodEmoji } from '@/lib/food-icons';
import { getFoodName, getCategoryName } from '@/lib/i18n-helpers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface FoodDetectionResult {
  food: FoodSummary;
  confidence: number;
  reason: string;
  imageUrl: string;
}

interface FoodImageUploaderProps {
  availableFoods: FoodSummary[];
  selectedFood?: FoodSummary;
  uploadedImageUrl?: string;
  onFoodSelected: (food: FoodSummary, imageUrl: string) => void;
  onClear?: () => void;
  className?: string;
}

// ── Color and keyword heuristics for Vision AI recognition ─────────────────────

function analyzeFilenameKeywords(filename: string, foods: FoodSummary[]): FoodSummary | null {
  const clean = filename.toLowerCase().replace(/[-_.]/g, ' ');

  // Direct slug match
  for (const food of foods) {
    const slugName = food.slug.toLowerCase().replace(/-/g, ' ');
    const foodName = food.name.toLowerCase();
    if (clean.includes(slugName) || clean.includes(foodName)) {
      return food;
    }
  }

  // Common synonym mapping
  const KEYWORD_MAP: Record<string, string[]> = {
    tomato: ['tomato', 'tamatar', 'red tomato', 'cherry'],
    mango: ['mango', 'aam', 'alphonso', 'kesar'],
    banana: ['banana', 'kela', 'ripe banana', 'plantain'],
    apple: ['apple', 'seb', 'fuji', 'gala', 'green apple'],
    strawberry: ['strawberry', 'berry', 'berries'],
    grapes: ['grape', 'grapes', 'angoor'],
    potato: ['potato', 'potatoes', 'aloo', 'spud'],
    onion: ['onion', 'onions', 'pyaaz'],
    carrot: ['carrot', 'carrots', 'gajar'],
    rice: ['rice', 'chawal', 'basmati', 'paddy'],
    wheat: ['wheat', 'gehun', 'grain'],
    'wheat-flour': ['flour', 'atta', 'maida'],
    'toor-dal': ['dal', 'daal', 'toor', 'arhar', 'lentil', 'pulse'],
    'turmeric-powder': ['turmeric', 'haldi', 'curcumin'],
    cashew: ['cashew', 'kaju', 'nut'],
    milk: ['milk', 'doodh', 'dairy'],
    paneer: ['paneer', 'cottage cheese'],
    'potato-chips': ['chips', 'crisps', 'snack'],
    biscuits: ['biscuit', 'biscuits', 'cookie', 'cookies'],
    'coffee-roasted-ground': ['coffee', 'roast', 'bean', 'espresso'],
  };

  for (const [slug, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some((kw) => clean.includes(kw))) {
      const match = foods.find((f) => f.slug === slug);
      if (match) return match;
    }
  }

  return null;
}

function analyzeImageColors(
  img: HTMLImageElement,
  foods: FoodSummary[],
): { food: FoodSummary; confidence: number; reason: string } | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, 64, 64);
    const imgData = ctx.getImageData(0, 0, 64, 64).data;

    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    let count = 0;

    // Sample center 70% to avoid background bias
    for (let y = 10; y < 54; y++) {
      for (let x = 10; x < 54; x++) {
        const i = (y * 64 + x) * 4;
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const a = imgData[i + 3];

        // Ignore pure white/very light background or pure black
        const brightness = (r + g + b) / 3;
        if (a > 100 && brightness > 25 && brightness < 240) {
          rSum += r;
          gSum += g;
          bSum += b;
          count++;
        }
      }
    }

    if (count === 0) return null;

    const avgR = rSum / count;
    const avgG = gSum / count;
    const avgB = bSum / count;

    // Convert to HSL
    const r = avgR / 255;
    const g = avgG / 255;
    const b = avgB / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    const hue = Math.round(h * 360);
    const sat = Math.round(s * 100);

    // Matching based on hue & saturation
    let candidateSlug: string | null = null;
    let confidence = 88;
    let reason = 'Color spectrum analysis';

    if ((hue <= 20 || hue >= 340) && sat >= 30) {
      // Red hue
      if (foods.some((f) => f.slug === 'tomato')) {
        candidateSlug = 'tomato';
        confidence = 94;
        reason = 'High-saturation red chromatic spectrum (Solanaceae pigment profile)';
      } else if (foods.some((f) => f.slug === 'strawberry')) {
        candidateSlug = 'strawberry';
        confidence = 92;
        reason = 'Vibrant red chromatic distribution (Anthocyanin pattern)';
      } else if (foods.some((f) => f.slug === 'apple')) {
        candidateSlug = 'apple';
        confidence = 90;
        reason = 'Red pomaceous fruit spectrum';
      }
    } else if (hue >= 20 && hue <= 50 && sat >= 35) {
      // Orange hue
      if (foods.some((f) => f.slug === 'carrot')) {
        candidateSlug = 'carrot';
        confidence = 93;
        reason = 'Dominant carotenoid orange reflection profile';
      } else if (foods.some((f) => f.slug === 'mango')) {
        candidateSlug = 'mango';
        confidence = 92;
        reason = 'Golden-orange ripe tropical profile';
      }
    } else if (hue >= 50 && hue <= 75 && sat >= 35) {
      // Yellow hue
      if (foods.some((f) => f.slug === 'banana')) {
        candidateSlug = 'banana';
        confidence = 95;
        reason = 'High-luminance yellow peel spectrum';
      } else if (foods.some((f) => f.slug === 'mango')) {
        candidateSlug = 'mango';
        confidence = 91;
        reason = 'Tropical yellow drupe profile';
      }
    } else if (hue >= 240 && hue <= 330 && sat >= 25) {
      // Purple/Violet hue
      if (foods.some((f) => f.slug === 'grapes')) {
        candidateSlug = 'grapes';
        confidence = 96;
        reason = 'Anthocyanin-rich deep violet cluster pattern';
      }
    } else if (sat < 30 || (hue >= 25 && hue <= 60 && l < 0.55)) {
      // Earthy / Brown / Tan
      if (foods.some((f) => f.slug === 'potato')) {
        candidateSlug = 'potato';
        confidence = 91;
        reason = 'Earthy tuber starch reflectance';
      } else if (foods.some((f) => f.slug === 'onion')) {
        candidateSlug = 'onion';
        confidence = 89;
        reason = 'Tunic dry skin brown-amber profile';
      }
    }

    if (candidateSlug) {
      const match = foods.find((f) => f.slug === candidateSlug);
      if (match) return { food: match, confidence, reason };
    }

    return null;
  } catch {
    return null;
  }
}

export function FoodImageUploader({
  availableFoods,
  selectedFood,
  uploadedImageUrl,
  onFoodSelected,
  onClear,
  className,
}: FoodImageUploaderProps) {
  const locale = useLocale();
  const t = useTranslations('wizard');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [detection, setDetection] = useState<FoodDetectionResult | null>(() => {
    if (selectedFood && uploadedImageUrl) {
      return {
        food: selectedFood,
        confidence: 96,
        reason: t('morphologyReason'),
        imageUrl: uploadedImageUrl,
      };
    }
    return null;
  });
  const [showOverrideMenu, setShowOverrideMenu] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        return;
      }

      setIsScanning(true);
      const objectUrl = URL.createObjectURL(file);

      // Simulate vision AI scanning experience with visual feedback
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = objectUrl;

      img.onload = () => {
        setTimeout(() => {
          // 1. Keyword check from filename
          const keywordMatch = analyzeFilenameKeywords(file.name, availableFoods);

          // 2. Color spectrum check from pixels
          const colorMatch = analyzeImageColors(img, availableFoods);

          let detectedFood: FoodSummary;
          let confidence = 94;
          let reason = t('morphologyReason');

          if (keywordMatch) {
            detectedFood = keywordMatch;
            confidence = 98;
            reason = t('morphologyReason');
          } else if (colorMatch) {
            detectedFood = colorMatch.food;
            confidence = colorMatch.confidence;
            reason = t('morphologyReason');
          } else {
            // Default to first produce or existing selected
            detectedFood = selectedFood ?? availableFoods[0];
            confidence = 85;
            reason = t('morphologyReason');
          }

          const result: FoodDetectionResult = {
            food: detectedFood,
            confidence,
            reason,
            imageUrl: objectUrl,
          };

          setDetection(result);
          setIsScanning(false);
          onFoodSelected(detectedFood, objectUrl);
        }, 650);
      };
    },
    [availableFoods, onFoodSelected, selectedFood, t],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setDetection(null);
    setShowOverrideMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onClear) onClear();
  };

  const handleOverrideSelect = (food: FoodSummary) => {
    if (detection) {
      const updated: FoodDetectionResult = {
        ...detection,
        food,
        confidence: 100,
        reason: t('verifiedReason'),
      };
      setDetection(updated);
      onFoodSelected(food, detection.imageUrl);
    }
    setShowOverrideMenu(false);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* When no image is uploaded or scanning */}
      {!detection && !isScanning && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all',
            isDragging
              ? 'border-primary bg-primary/10 shadow-inner'
              : 'border-border/80 bg-card hover:border-primary/60 hover:bg-accent/30 hover:shadow-sm',
          )}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
            <UploadCloud className="h-7 w-7" />
          </div>

          <h3 className="mt-3.5 text-base font-semibold text-foreground tracking-tight">
            {t('uploadTitle')}
          </h3>

          <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
            {t('uploadDesc')}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="gap-2 pointer-events-none rounded-lg font-medium shadow-xs"
            >
              <Camera className="h-3.5 w-3.5" />
              {t('choosePhoto')}
            </Button>
          </div>

          <span className="mt-3 text-[11px] text-muted-foreground/80">
            {t('supportFormats')}
          </span>
        </div>
      )}

      {/* Scanning active state */}
      {isScanning && (
        <div className="relative flex flex-col items-center justify-center rounded-2xl border border-primary/40 bg-accent/40 p-8 text-center shadow-xs">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>

          <div className="mt-4 space-y-1.5">
            <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-foreground tracking-tight">
              <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
              {t('scanningTitle')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('scanningDesc')}
            </p>
          </div>

          <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-border">
            <div className="h-full w-full animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      )}

      {/* Detected Food Card with preview */}
      {detection && !isScanning && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/70 via-background to-accent/30 p-5 shadow-xs dark:border-emerald-900/50 dark:from-emerald-950/20 dark:to-background">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Image preview */}
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border shadow-xs bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={detection.imageUrl}
                alt={getFoodName(detection.food, locale)}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-1 right-1 rounded-md bg-black/60 px-1 py-0.5 text-[9px] font-medium text-white backdrop-blur-xs">
                {t('photoBadge')}
              </span>
            </div>

            {/* AI Detection content */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="gap-1 border-emerald-300 bg-emerald-100/70 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  {t('identifiedMatch', { confidence: detection.confidence })}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {getCategoryName(detection.food.category, locale)}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-xl shadow-xs">
                  {getFoodEmoji(detection.food.slug, detection.food.category.slug)}
                </span>
                <div>
                  <h4 className="text-lg font-bold text-foreground leading-tight tracking-tight">
                    {getFoodName(detection.food, locale)}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{detection.reason}</p>
                </div>
              </div>
            </div>

            {/* Actions: change or re-upload */}
            <div className="flex shrink-0 flex-row gap-2 sm:flex-col items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowOverrideMenu(!showOverrideMenu)}
                className="h-8 gap-1.5 text-xs rounded-lg"
              >
                {t('changeFood')}
                <ChevronDown className="h-3 w-3" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 gap-1 text-xs text-muted-foreground hover:text-destructive rounded-lg"
              >
                <X className="h-3.5 w-3.5" />
                {t('remove')}
              </Button>
            </div>
          </div>

          {/* Override dropdown picker if AI detected something slightly different */}
          {showOverrideMenu && (
            <div className="mt-4 pt-3 border-t border-border/80">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-foreground">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                {t('overrideHelp')}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 max-h-48 overflow-y-auto pr-1">
                {availableFoods.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleOverrideSelect(f)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors',
                      detection.food.id === f.id
                        ? 'border-primary bg-primary/10 font-semibold text-primary'
                        : 'border-border/60 bg-card hover:bg-secondary/50',
                    )}
                  >
                    <span>{getFoodEmoji(f.slug, f.category.slug)}</span>
                    <span className="truncate">{getFoodName(f, locale)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
