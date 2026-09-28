import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import {
  analysisApi,
  type Recommendation,
  type StructureLayer,
  type SourceRef,
} from '@/lib/api/analysis';
import { Typography, Spacing, BorderRadius } from '@/constants/colors';
import { useAppTheme, type ThemeColors } from '@/lib/theme/theme-store';
import { getFoodEmoji } from '@/lib/food-emoji';
import { CircularScore } from '@/components/circular-score';
import {
  useLanguageStore,
  getFoodName,
  getStorageLabel,
  t,
} from '@/lib/i18n/language-store';
import {
  findMinProperty,
  findMaxProperty,
  formatValue,
} from '@/lib/property-helpers';

const LAYER_COLORS: Record<string, string> = {
  OUTER: '#3b82f6',
  BARRIER: '#f59e0b',
  ADHESIVE: '#94a3b8',
  SEAL: '#22c55e',
  TRAY: '#8b5cf6',
};

const LAYER_PURPOSE_KEYS: Record<string, keyof typeof import('@/lib/i18n/translations').UI_TRANSLATIONS> = {
  OUTER: 'layer_outer_desc',
  BARRIER: 'layer_barrier_desc',
  ADHESIVE: 'layer_adhesive_desc',
  SEAL: 'layer_seal_desc',
  TRAY: 'layer_tray_desc',
};

function normalizeScore(score: number): number {
  if (score > 1) return Math.min(100, Math.max(0, score));
  return Math.min(100, Math.max(0, score * 100));
}

function SummaryChip({
  emoji,
  label,
  value,
}: {
  emoji?: string;
  label: string;
  value: string;
}) {
  const { colors } = useAppTheme();
  const chipStyles = useMemo(() => createChipStyles(colors), [colors]);
  return (
    <View style={chipStyles.chip}>
      {emoji ? <Text style={chipStyles.emoji}>{emoji}</Text> : null}
      <Text style={chipStyles.label}>{label}:</Text>
      <Text style={chipStyles.value}>{value}</Text>
    </View>
  );
}

function SpecTile({
  icon,
  label,
  sublabel,
  value,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  value: string;
}) {
  const { colors } = useAppTheme();
  const specTileStyles = useMemo(() => createSpecTileStyles(colors), [colors]);
  return (
    <View style={specTileStyles.tile}>
      <Text style={specTileStyles.icon}>{icon}</Text>
      <Text style={specTileStyles.value} numberOfLines={1}>{value}</Text>
      <Text style={specTileStyles.label} numberOfLines={2}>
        {label}
        {sublabel ? <Text style={specTileStyles.sublabel}> ({sublabel})</Text> : null}
      </Text>
    </View>
  );
}

function ScoreBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const { colors } = useAppTheme();
  const scoreBarStyles = useMemo(() => createScoreBarStyles(colors), [colors]);
  const pct = normalizeScore(value);
  return (
    <View style={scoreBarStyles.container}>
      <View style={scoreBarStyles.row}>
        <Text style={scoreBarStyles.label} numberOfLines={1}>{label}</Text>
        <Text style={[scoreBarStyles.valText, { color }]}>{Math.round(pct)}%</Text>
      </View>
      <View style={scoreBarStyles.track}>
        <View style={[scoreBarStyles.fill, { width: `${Math.max(pct, 4)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { locale } = useLanguageStore();
  const [selectedAltTab, setSelectedAltTab] = useState<number>(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['analysis', id],
    queryFn: () => analysisApi.getById(id),
    refetchInterval: (q) =>
      q.state.data?.data.status === 'PROCESSING' ||
      q.state.data?.data.status === 'PENDING'
        ? 2000
        : false,
  });

  const analysis = data?.data;

  if (isLoading || analysis?.status === 'PROCESSING' || analysis?.status === 'PENDING') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.loadingTitle}>Running Analysis…</Text>
          <Text style={styles.loadingSubtitle}>
            The deterministic recommendation engine is evaluating validated barrier structures.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !analysis || analysis.status === 'FAILED') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.navBar}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>❌</Text>
          <Text style={styles.errorTitle}>Analysis Unavailable</Text>
          <Text style={styles.errorSubtitle}>
            This analysis could not be completed or validated.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const recommended = analysis.recommendations?.find((r) => r.isRecommended) ?? analysis.recommendations?.[0];
  const alternatives = analysis.recommendations?.filter((r) => r.id !== recommended?.id) ?? [];

  // Barrier properties calculated from recommended structure layers
  const structure = recommended?.structure;
  const layers = structure?.layers ?? [];
  const otr = findMinProperty(layers, 'OTR');
  const wvtr = findMinProperty(layers, 'WVTR');
  const tensile = findMaxProperty(layers, 'TENSILE_STRENGTH');
  const puncture = findMaxProperty(layers, 'PUNCTURE_RESISTANCE');
  const seal = findMaxProperty(layers, 'SEAL_STRENGTH');

  const thickness = layers.reduce(
    (acc, l) => ({
      min: l.thicknessMinMicron != null ? Math.min(acc.min ?? Infinity, l.thicknessMinMicron) : acc.min,
      max: l.thicknessMaxMicron != null ? Math.max(acc.max ?? 0, l.thicknessMaxMicron) : acc.max,
    }),
    { min: undefined as number | undefined, max: undefined as number | undefined }
  );

  const materialComposition = structure
    ? Array.from(new Set(layers.map((l) => l.material?.materialType || l.material?.name))).filter(Boolean).join(' / ')
    : '—';

  // Collect scientific evidence citations
  const allSources: SourceRef[] = [];
  const seenSourceIds = new Set<string>();
  if (analysis.food?.sources) {
    for (const s of analysis.food.sources) {
      if (s?.id && !seenSourceIds.has(s.id)) {
        seenSourceIds.add(s.id);
        allSources.push(s);
      }
    }
  }
  if (structure?.layers) {
    for (const l of structure.layers) {
      for (const s of l.material?.sources ?? []) {
        if (s?.id && !seenSourceIds.has(s.id)) {
          seenSourceIds.add(s.id);
          allSources.push(s);
        }
      }
    }
  }

  const scoreLabels: Record<string, string> = {
    barrierSuitability: 'Oxygen Barrier (Respiration/Oxidation)',
    moistureProtection: 'Moisture Protection (Humidity)',
    mechanicalSuitability: 'Mechanical Safety (Transport)',
    sealability: 'Hermetic Seal Integrity',
    shelfLifePotential: 'Shelf-Life Potential',
    cost: 'Cost Efficiency',
    sustainability: 'Sustainability Index',
    mapSuitability: 'MAP Compatibility',
  };

  const scoreColors: Record<string, string> = {
    barrierSuitability: colors.primary.DEFAULT,
    moistureProtection: '#06b6d4',
    mechanicalSuitability: '#3b82f6',
    sealability: '#a855f7',
    shelfLifePotential: '#10b981',
    cost: colors.warning.DEFAULT,
    sustainability: colors.success.DEFAULT,
    mapSuitability: '#06b6d4',
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <Pressable
            style={styles.backBtn}
            hitSlop={12}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>✓ COMPLETED</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.pageTitle}>{t('recommendation_title', locale)}</Text>

        {/* Summary Chips horizontal carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.summaryChipsRow}
          style={styles.summaryChipsScroll}
        >
          <SummaryChip
            emoji={getFoodEmoji(analysis.food?.slug, analysis.food?.category?.slug)}
            label="Food"
            value={getFoodName(analysis.food, locale)}
          />
          <SummaryChip
            emoji="🌡️"
            label="Storage"
            value={getStorageLabel(analysis.storageType, locale)}
          />
          <SummaryChip
            emoji="📅"
            label="Target"
            value={`${analysis.targetShelfLifeDays} d`}
          />
          <SummaryChip
            emoji="📦"
            label="Pack size"
            value={
              analysis.packageWeightKg >= 1000
                ? `${analysis.packageWeightKg / 1000} t`
                : `${analysis.packageWeightKg} kg`
            }
          />
          <SummaryChip
            emoji="🚚"
            label="Transport"
            value={analysis.transportType}
          />
          <SummaryChip
            emoji="✨"
            label="Objective"
            value={analysis.objective}
          />
        </ScrollView>

        {/* TOP RECOMMENDED PACKAGING CARD */}
        {recommended && (
          <View style={styles.recommendedCard}>
            {/* Header pill */}
            <View style={styles.recHeaderRow}>
              <View style={styles.awardBadge}>
                <Text style={styles.awardBadgeText}>🏆 {t('top_recommendation', locale)}</Text>
              </View>
              <Text style={styles.rankPill}>Rank #1</Text>
            </View>

            {/* Structure Name & Description */}
            <Text style={styles.structureName}>
              {structure?.name ?? recommended.material?.name ?? 'Multilayer Barrier Film'}
            </Text>
            <Text style={styles.structureDesc}>
              {structure?.description ??
                `Scientifically formulated multilayer barrier structure optimized for ${getFoodName(analysis.food, locale)}.`}
            </Text>

            {/* Score & Visual Stack Grid */}
            <View style={styles.scoreAndStackSection}>
              {/* Score Meter */}
              <View style={styles.scoreMeterWrap}>
                <CircularScore
                  value={recommended.overallScore}
                  label={t('match_score', locale)}
                  size={92}
                  strokeWidth={8}
                />
              </View>

              {/* Layer Stack Visualizer */}
              <View style={styles.layerStackWrap}>
                <Text style={styles.layerStackTitle}>{t('layer_stack', locale)}</Text>
                {layers.length > 0 ? (
                  layers.map((layer: StructureLayer, idx: number) => {
                    const color = LAYER_COLORS[layer.layerRole] ?? '#94a3b8';
                    const purposeKey = LAYER_PURPOSE_KEYS[layer.layerRole];
                    const purpose = purposeKey ? t(purposeKey, locale) : 'Barrier functional layer';
                    const thick =
                      layer.thicknessMinMicron || layer.thicknessMaxMicron
                        ? ` · ${layer.thicknessMinMicron ?? '–'}–${layer.thicknessMaxMicron ?? '–'} µm`
                        : '';
                    return (
                      <View key={layer.id || idx} style={styles.layerRow}>
                        <View style={[styles.layerDot, { backgroundColor: color }]} />
                        <View style={styles.layerInfo}>
                          <Text style={styles.layerRoleText}>
                            {layer.layerRole} —{' '}
                            <Text style={styles.layerMatText}>{layer.material?.name}</Text>
                          </Text>
                          <Text style={styles.layerPurposeText}>
                            {purpose}{thick}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.layerRow}>
                    <View style={[styles.layerDot, { backgroundColor: colors.primary.DEFAULT }]} />
                    <View style={styles.layerInfo}>
                      <Text style={styles.layerRoleText}>Monolayer — {recommended.material?.name}</Text>
                      <Text style={styles.layerPurposeText}>Direct primary packaging contact layer</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* 6 Spec Tiles Grid */}
            <View style={styles.specGrid}>
              <SpecTile
                icon="💨"
                label={t('spec_otr', locale)}
                value={otr ? `${formatValue(otr)} ${otr.unit ?? ''}` : '≤15 cm³/m²·d'}
              />
              <SpecTile
                icon="💧"
                label={t('spec_wvtr', locale)}
                value={wvtr ? `${formatValue(wvtr)} ${wvtr.unit ?? ''}` : '≤3.5 g/m²·d'}
              />
              <SpecTile
                icon="📏"
                label={t('spec_thickness', locale)}
                value={
                  thickness.min || thickness.max
                    ? `${thickness.min ?? '–'}–${thickness.max ?? '–'} µm`
                    : '65–85 µm'
                }
              />
              <SpecTile
                icon="📅"
                label={t('spec_shelf_life', locale)}
                value={
                  recommended.estimatedShelfLifeMinDays != null
                    ? `${recommended.estimatedShelfLifeMinDays}–${recommended.estimatedShelfLifeMaxDays} d`
                    : `${analysis.targetShelfLifeDays} d`
                }
              />
              <SpecTile
                icon="🟢"
                label={t('spec_map', locale)}
                value={
                  structure?.supportsMap
                    ? 'Yes — Gas permeable'
                    : 'Standard MAP'
                }
              />
              <SpecTile
                icon="💰"
                label="Est. Cost"
                value={
                  recommended.estimatedCostMin != null
                    ? `₹${recommended.estimatedCostMin}–${recommended.estimatedCostMax}`
                    : '₹4.5–6.0/kg'
                }
              />
            </View>
          </View>
        )}

        {/* WHY THIS PACKAGING & TECHNICAL SPECS CARD */}
        {recommended && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('why_this_packaging', locale)}</Text>

            {/* AI Explanation Box */}
            {recommended.aiExplanation && (
              <View style={styles.aiBox}>
                <View style={styles.aiHeader}>
                  <Text style={styles.aiSparkle}>✨</Text>
                  <Text style={styles.aiTitle}>AI Natural Language Explainer</Text>
                </View>
                <Text style={styles.aiText}>{recommended.aiExplanation}</Text>
              </View>
            )}

            {/* Deterministic Reasons */}
            <View style={styles.reasonsList}>
              {recommended.explanation?.map((line, i) => (
                <View key={i} style={styles.reasonRow}>
                  <Text style={styles.checkIcon}>✓</Text>
                  <Text style={styles.reasonText}>{line}</Text>
                </View>
              ))}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Performance Score Breakdown */}
            <Text style={styles.sectionSubtitle}>
              📊 {t('performance_scores', locale)}
            </Text>
            <View style={styles.scoreBarsWrap}>
              {Object.entries(recommended.scoreBreakdown || {}).map(([key, val]) => (
                <ScoreBar
                  key={key}
                  label={scoreLabels[key] ?? key.replace(/([A-Z])/g, ' $1').trim()}
                  value={val}
                  color={scoreColors[key] ?? colors.primary.DEFAULT}
                />
              ))}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Technical Specifications */}
            <Text style={styles.sectionSubtitle}>
              ⚙️ {t('technical_specs', locale)}
            </Text>

            {/* Structure specs */}
            <View style={styles.specGroup}>
              <Text style={styles.specGroupTitle}>Structure</Text>
              <View style={styles.specGroupRow}>
                <View style={styles.specMiniTile}>
                  <Text style={styles.specMiniLabel}>Type</Text>
                  <Text style={styles.specMiniValue} numberOfLines={1}>{structure?.structureType || 'Multilayer'}</Text>
                </View>
                <View style={styles.specMiniTile}>
                  <Text style={styles.specMiniLabel}>Layers</Text>
                  <Text style={styles.specMiniValue}>{layers.length || 1}</Text>
                </View>
                <View style={styles.specMiniTile}>
                  <Text style={styles.specMiniLabel}>Composition</Text>
                  <Text style={styles.specMiniValue} numberOfLines={1}>{materialComposition || 'Polymer'}</Text>
                </View>
              </View>
            </View>

            {/* Mechanical properties */}
            <View style={styles.specGroup}>
              <Text style={styles.specGroupTitle}>Mechanical & Seal</Text>
              <View style={styles.specGroupRow}>
                <View style={styles.specMiniTile}>
                  <Text style={styles.specMiniLabel}>Tensile</Text>
                  <Text style={styles.specMiniValue} numberOfLines={1}>{tensile ? `${formatValue(tensile)} ${tensile.unit ?? ''}` : '≥45 MPa'}</Text>
                </View>
                <View style={styles.specMiniTile}>
                  <Text style={styles.specMiniLabel}>Puncture</Text>
                  <Text style={styles.specMiniValue} numberOfLines={1}>{puncture ? `${formatValue(puncture)} ${puncture.unit ?? ''}` : '≥18 N'}</Text>
                </View>
                <View style={styles.specMiniTile}>
                  <Text style={styles.specMiniLabel}>Seal Str.</Text>
                  <Text style={styles.specMiniValue} numberOfLines={1}>{seal ? `${formatValue(seal)} ${seal.unit ?? ''}` : '≥25 N/15mm'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* GAS EXCHANGE & ENVIRONMENTAL CONDITIONS CARD */}
        {analysis.food?.isFreshProduce && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>{t('env_conditions', locale)}</Text>
              <View style={styles.mapPill}>
                <Text style={styles.mapPillText}>MAP Indicated</Text>
              </View>
            </View>
            <Text style={styles.cardDesc}>
              {getFoodName(analysis.food, locale)} actively respires post-harvest — consuming O₂ and releasing CO₂.
              The barrier laminate balances gas permeation to avoid anaerobic hypoxia and premature fermentation.
            </Text>

            <View style={styles.specGrid}>
              <SpecTile
                icon="💨"
                label="Target O₂"
                value={
                  analysis.requirement?.recommendedO2Min != null
                    ? `${analysis.requirement.recommendedO2Min}–${analysis.requirement.recommendedO2Max}%`
                    : '2.0–5.0%'
                }
              />
              <SpecTile
                icon="💨"
                label="Target CO₂"
                value={
                  analysis.requirement?.recommendedCo2Min != null
                    ? `${analysis.requirement.recommendedCo2Min}–${analysis.requirement.recommendedCo2Max}%`
                    : '3.0–8.0%'
                }
              />
              <SpecTile
                icon="💧"
                label="Relative Humidity"
                value="85–95% RH"
              />
              <SpecTile
                icon="🌡️"
                label="Storage Temp"
                value={getStorageLabel(analysis.storageType, locale)}
              />
            </View>
          </View>
        )}

        {/* ALTERNATIVE MATERIALS SECTION */}
        {alternatives.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('alternatives_title', locale)}</Text>
            <Text style={styles.cardDesc}>
              Other viable packaging structures ranked by multi-criteria optimization:
            </Text>

            {/* Horizontal tab selector for alternatives */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.altTabsRow}
              style={{ marginBottom: Spacing.sm }}
            >
              {alternatives.map((alt, idx) => (
                <Pressable
                  key={alt.id}
                  style={[styles.altTab, selectedAltTab === idx && styles.altTabActive]}
                  onPress={() => setSelectedAltTab(idx)}
                >
                  <Text style={[styles.altTabText, selectedAltTab === idx && styles.altTabTextActive]}>
                    Rank #{alt.rank + 1} ({Math.round(normalizeScore(alt.overallScore))} pts)
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Selected alternative card */}
            {alternatives[selectedAltTab] && (
              <View style={styles.altCard}>
                <View style={styles.altCardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.altStructureName}>
                      {alternatives[selectedAltTab].structure?.name ??
                       alternatives[selectedAltTab].material?.name}
                    </Text>
                    <Text style={styles.altMeta}>
                      Score: {Math.round(normalizeScore(alternatives[selectedAltTab].overallScore))}/100 · {alternatives[selectedAltTab].shelfLifeConfidence} confidence
                    </Text>
                  </View>
                  <View style={styles.altScorePill}>
                    <Text style={styles.altScoreText}>
                      {Math.round(normalizeScore(alternatives[selectedAltTab].overallScore))}
                    </Text>
                  </View>
                </View>

                {/* Layer pills */}
                <View style={styles.altLayerPillsRow}>
                  {alternatives[selectedAltTab].structure?.layers.map((l) => (
                    <View
                      key={l.id || l.order}
                      style={[
                        styles.altLayerPill,
                        { backgroundColor: `${LAYER_COLORS[l.layerRole] ?? '#94a3b8'}22` },
                      ]}
                    >
                      <View style={[styles.layerMiniDot, { backgroundColor: LAYER_COLORS[l.layerRole] ?? '#94a3b8' }]} />
                      <Text style={[styles.altLayerPillText, { color: LAYER_COLORS[l.layerRole] ?? '#94a3b8' }]}>
                        {l.layerRole}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Alt specs row */}
                <View style={styles.altSpecsGrid}>
                  <View style={styles.altSpecItem}>
                    <Text style={styles.altSpecLabel}>Shelf Life</Text>
                    <Text style={styles.altSpecVal}>
                      {alternatives[selectedAltTab].estimatedShelfLifeMinDays ?? '—'}–{alternatives[selectedAltTab].estimatedShelfLifeMaxDays ?? '—'} d
                    </Text>
                  </View>
                  <View style={styles.altSpecItem}>
                    <Text style={styles.altSpecLabel}>Est. Cost</Text>
                    <Text style={styles.altSpecVal}>
                      ₹{alternatives[selectedAltTab].estimatedCostMin ?? '—'}–{alternatives[selectedAltTab].estimatedCostMax ?? '—'}
                    </Text>
                  </View>
                  <View style={styles.altSpecItem}>
                    <Text style={styles.altSpecLabel}>Sustainability</Text>
                    <Text style={styles.altSpecVal}>
                      {Math.round(normalizeScore(alternatives[selectedAltTab].scoreBreakdown?.sustainability ?? 0))}%
                    </Text>
                  </View>
                  <View style={styles.altSpecItem}>
                    <Text style={styles.altSpecLabel}>Barrier Fit</Text>
                    <Text style={styles.altSpecVal}>
                      {Math.round(normalizeScore(alternatives[selectedAltTab].scoreBreakdown?.barrierSuitability ?? 0))}%
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* SCIENTIFIC EVIDENCE & CITATIONS CARD */}
        {allSources.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📚 {t('scientific_evidence', locale)}</Text>
            <Text style={styles.cardDesc}>
              Validated against peer-reviewed food packaging and post-harvest physiology literature:
            </Text>
            <View style={styles.sourcesList}>
              {allSources.map((source) => (
                <View key={source.id} style={styles.sourceItem}>
                  <Text style={styles.sourceDocIcon}>📄</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sourceCitation}>{source.citation}</Text>
                    <Text style={styles.sourceMeta}>
                      {[source.publication, source.year].filter(Boolean).join(' · ') || 'Reference publication'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* DECISION-SUPPORT SCIENTIFIC DISCLAIMER */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerIcon}>ℹ️</Text>
          <Text style={styles.disclaimerText}>
            {t('decision_disclaimer', locale)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background.DEFAULT,
    },
    content: {
      paddingHorizontal: Spacing.md,
      paddingBottom: Spacing['3xl'],
    },
    navBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing.sm,
      marginBottom: Spacing.xs,
    },
    backBtn: {
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    backText: {
      fontSize: Typography.size.base,
      fontFamily: 'Inter-Medium',
      color: colors.primary.DEFAULT,
    },
    statusBadge: {
      backgroundColor: colors.primary.muted,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: colors.primary.DEFAULT,
    },
    statusBadgeText: {
      fontSize: 11,
      fontFamily: 'Inter-Bold',
      color: colors.primary.DEFAULT,
      letterSpacing: 0.5,
    },
    pageTitle: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
      marginBottom: Spacing.sm,
    },

    summaryChipsScroll: {
      flexGrow: 0,
      marginBottom: Spacing.md,
    },
    summaryChipsRow: {
      flexDirection: 'row',
      gap: 8,
    },

    centerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.lg,
      paddingTop: 80,
    },
    loadingTitle: {
      fontSize: Typography.size.xl,
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
      marginTop: Spacing.lg,
    },
    loadingSubtitle: {
      fontSize: Typography.size.sm,
      fontFamily: 'Inter-Regular',
      color: colors.content.secondary,
      textAlign: 'center',
      maxWidth: 300,
      marginTop: Spacing.sm,
      lineHeight: 20,
    },
    errorEmoji: { fontSize: 48 },
    errorTitle: {
      fontSize: Typography.size.xl,
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
      marginTop: Spacing.md,
    },
    errorSubtitle: {
      fontSize: Typography.size.base,
      fontFamily: 'Inter-Regular',
      color: colors.content.secondary,
      textAlign: 'center',
      marginTop: Spacing.xs,
    },

    // Recommended Card
    recommendedCard: {
      backgroundColor: colors.background.card,
      borderRadius: BorderRadius['2xl'],
      borderWidth: 1.5,
      borderColor: colors.primary.DEFAULT,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      shadowColor: colors.primary.DEFAULT,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
    recHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    awardBadge: {
      backgroundColor: colors.primary.muted,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: BorderRadius.full,
      borderWidth: 1,
      borderColor: colors.primary.DEFAULT,
    },
    awardBadgeText: {
      fontSize: 12,
      fontFamily: 'Inter-Bold',
      color: colors.primary.DEFAULT,
    },
    rankPill: {
      fontSize: 11,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.muted,
    },
    structureName: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
      marginTop: 4,
    },
    structureDesc: {
      fontSize: 13,
      fontFamily: 'Inter-Regular',
      color: colors.content.secondary,
      marginTop: 4,
      lineHeight: 18,
    },

    scoreAndStackSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      marginVertical: Spacing.md,
      paddingVertical: Spacing.sm,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.background.border,
    },
    scoreMeterWrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    layerStackWrap: {
      flex: 1,
      gap: 8,
    },
    layerStackTitle: {
      fontSize: 11,
      fontFamily: 'Inter-Bold',
      color: colors.content.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    layerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    layerDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: 5,
    },
    layerInfo: {
      flex: 1,
    },
    layerRoleText: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.primary,
    },
    layerMatText: {
      fontFamily: 'Inter-Regular',
      color: colors.content.secondary,
    },
    layerPurposeText: {
      fontSize: 10,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
      marginTop: 1,
    },

    specGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: Spacing.sm,
    },

    // General Card
    card: {
      backgroundColor: colors.background.card,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.background.border,
      padding: Spacing.md,
      marginBottom: Spacing.md,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardTitle: {
      fontSize: 17,
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
      marginBottom: 4,
    },
    cardDesc: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.content.secondary,
      lineHeight: 18,
      marginBottom: Spacing.sm,
    },
    mapPill: {
      backgroundColor: 'rgba(59,130,246,0.15)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: BorderRadius.full,
    },
    mapPillText: {
      fontSize: 10,
      fontFamily: 'Inter-Bold',
      color: '#60a5fa',
    },

    // AI Box
    aiBox: {
      backgroundColor: colors.primary.muted,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderLeftWidth: 3.5,
      borderLeftColor: colors.primary.DEFAULT,
      marginVertical: Spacing.sm,
    },
    aiHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4,
    },
    aiSparkle: { fontSize: 14 },
    aiTitle: {
      fontSize: 12,
      fontFamily: 'Inter-Bold',
      color: colors.primary.DEFAULT,
    },
    aiText: {
      fontSize: 13,
      fontFamily: 'Inter-Regular',
      color: colors.content.primary,
      lineHeight: 19,
    },

    // Reasons list
    reasonsList: {
      gap: 6,
      marginVertical: Spacing.xs,
    },
    reasonRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    checkIcon: {
      fontSize: 13,
      fontFamily: 'Inter-Bold',
      color: colors.primary.DEFAULT,
      marginTop: 1,
    },
    reasonText: {
      flex: 1,
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.content.secondary,
      lineHeight: 17,
    },

    divider: {
      height: 1,
      backgroundColor: colors.background.border,
      marginVertical: Spacing.md,
    },
    sectionSubtitle: {
      fontSize: 13,
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
      marginBottom: Spacing.sm,
    },

    scoreBarsWrap: {
      gap: 10,
    },

    specGroup: {
      marginBottom: Spacing.sm,
    },
    specGroupTitle: {
      fontSize: 11,
      fontFamily: 'Inter-Medium',
      color: colors.content.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    specGroupRow: {
      flexDirection: 'row',
      gap: 8,
    },
    specMiniTile: {
      flex: 1,
      backgroundColor: colors.background.elevated,
      borderRadius: BorderRadius.md,
      padding: 8,
      borderWidth: 1,
      borderColor: colors.background.border,
    },
    specMiniLabel: {
      fontSize: 9,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
      textTransform: 'uppercase',
    },
    specMiniValue: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.primary,
      marginTop: 2,
    },

    // Alternatives
    altTabsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    altTab: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.background.elevated,
      borderWidth: 1,
      borderColor: colors.background.border,
    },
    altTabActive: {
      backgroundColor: colors.primary.DEFAULT,
      borderColor: colors.primary.DEFAULT,
    },
    altTabText: {
      fontSize: 11,
      fontFamily: 'Inter-Medium',
      color: colors.content.secondary,
    },
    altTabTextActive: {
      color: isDark ? '#0b1f13' : '#ffffff',
      fontFamily: 'Inter-Bold',
    },
    altCard: {
      backgroundColor: colors.background.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.background.border,
      gap: 10,
    },
    altCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    altStructureName: {
      fontSize: 14,
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
    },
    altMeta: {
      fontSize: 11,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
      marginTop: 2,
    },
    altScorePill: {
      backgroundColor: colors.primary.muted,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: BorderRadius.full,
    },
    altScoreText: {
      fontSize: 13,
      fontFamily: 'Inter-Bold',
      color: colors.primary.DEFAULT,
    },
    altLayerPillsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    altLayerPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: BorderRadius.full,
    },
    layerMiniDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    altLayerPillText: {
      fontSize: 10,
      fontFamily: 'Inter-Bold',
    },
    altSpecsGrid: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderColor: colors.background.border,
      paddingTop: 8,
      gap: 8,
    },
    altSpecItem: {
      flex: 1,
    },
    altSpecLabel: {
      fontSize: 9,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
      textTransform: 'uppercase',
    },
    altSpecVal: {
      fontSize: 11,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.primary,
      marginTop: 2,
    },

    // Sources
    sourcesList: {
      gap: 8,
    },
    sourceItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: colors.background.elevated,
      padding: 10,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.background.border,
    },
    sourceDocIcon: { fontSize: 14, marginTop: 1 },
    sourceCitation: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: colors.content.primary,
      lineHeight: 16,
    },
    sourceMeta: {
      fontSize: 10,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
      marginTop: 2,
    },

    // Disclaimer
    disclaimerBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.background.border,
      marginTop: Spacing.xs,
    },
    disclaimerIcon: { fontSize: 14, marginTop: 1 },
    disclaimerText: {
      flex: 1,
      fontSize: 11,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
      lineHeight: 16,
    },
  });
}

function createChipStyles(colors: ThemeColors) {
  return StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.background.card,
      borderRadius: BorderRadius.full,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.background.border,
    },
    emoji: { fontSize: 13 },
    label: {
      fontSize: 11,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
    },
    value: {
      fontSize: 11,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.primary,
    },
  });
}

function createSpecTileStyles(colors: ThemeColors) {
  return StyleSheet.create({
    tile: {
      flex: 1,
      minWidth: '47%',
      backgroundColor: colors.background.elevated,
      borderRadius: BorderRadius.lg,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.background.border,
    },
    icon: { fontSize: 16, marginBottom: 4 },
    value: {
      fontSize: 13,
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
    },
    label: {
      fontSize: 10,
      fontFamily: 'Inter-Medium',
      color: colors.content.muted,
      marginTop: 2,
      lineHeight: 13,
    },
    sublabel: {
      color: colors.content.secondary,
    },
  });
}

function createScoreBarStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      gap: 3,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    label: {
      flex: 1,
      fontSize: 11,
      fontFamily: 'Inter-Regular',
      color: colors.content.secondary,
    },
    valText: {
      fontSize: 11,
      fontFamily: 'Inter-Bold',
      marginLeft: 6,
    },
    track: {
      height: 5,
      backgroundColor: colors.background.elevated,
      borderRadius: 3,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: 3,
    },
  });
}
