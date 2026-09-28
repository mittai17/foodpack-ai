/**
 * Material Detail Screen — Full parity with web /materials/[slug]
 *
 * Displays validated barrier kinetics, mechanical strength, sustainability ratings,
 * and scientific literature citations for a selected packaging material.
 */
import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { materialsApi, type LayerMaterial, type MaterialProperty } from '@/lib/api/analysis';
import { Spacing, BorderRadius, Typography } from '@/constants/colors';
import { useAppTheme, type ThemeColors } from '@/lib/theme/theme-store';
import { useLanguageStore } from '@/lib/i18n/language-store';

function getMaterialIcon(slug: string = ''): string {
  const s = slug.toLowerCase();
  if (s.includes('alu') || s.includes('foil')) return '🪙';
  if (s.includes('met-') || s.includes('metallized')) return '✨';
  if (s.includes('pla') || s.includes('cellulose')) return '🌱';
  if (s.includes('jute')) return '🌾';
  if (s.includes('crate')) return '🧺';
  if (s.includes('tray')) return '🍱';
  if (s.includes('corrugated') || s.includes('board')) return '📦';
  if (s.includes('sack') || s.includes('woven')) return '🛍️';
  if (s.includes('perf')) return '💨';
  if (s.includes('evoh') || s.includes('bopa')) return '🛡️';
  return '📜';
}

function getPropertyLabel(propType: string): string {
  switch (propType) {
    case 'OTR':
      return 'Oxygen Transmission Rate (OTR)';
    case 'WVTR':
      return 'Water Vapor Transmission Rate (WVTR)';
    case 'THICKNESS':
      return 'Film Thickness / Gauge';
    case 'TENSILE_STRENGTH':
      return 'Tensile Strength';
    case 'SEAL_STRENGTH':
      return 'Heat Seal Strength';
    case 'PUNCTURE_RESISTANCE':
      return 'Puncture Resistance';
    default:
      return propType.replace(/_/g, ' ');
  }
}

function formatPropertyValue(p: MaterialProperty): string {
  if (p.minValue !== undefined && p.maxValue !== undefined && p.minValue !== null && p.maxValue !== null) {
    if (p.minValue === p.maxValue) return `${p.minValue} ${p.unit ?? ''}`;
    return `${p.minValue} – ${p.maxValue} ${p.unit ?? ''}`;
  }
  if (p.value !== undefined && p.value !== null) {
    return `${p.value} ${p.unit ?? ''}`;
  }
  if (p.minValue !== undefined && p.minValue !== null) {
    return `≥ ${p.minValue} ${p.unit ?? ''}`;
  }
  if (p.maxValue !== undefined && p.maxValue !== null) {
    return `≤ ${p.maxValue} ${p.unit ?? ''}`;
  }
  return 'N/A';
}

export default function MaterialDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { locale } = useLanguageStore();

  const { data: material, isLoading } = useQuery({
    queryKey: ['material', slug],
    queryFn: () => materialsApi.byId(slug as string),
    enabled: !!slug,
  });

  const mat: LayerMaterial | undefined = material?.data;

  const handleStartAnalysis = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/analysis/wizard/step-0-food');
  };

  if (isLoading || !mat) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading material specification...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Bar */}
      <View style={styles.topHeader}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{mat.name}</Text>
          <Text style={styles.headerSub}>{mat.materialType ?? 'PACKAGING FILM'}</Text>
        </View>
        <Pressable
          style={styles.doneBtn}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Hero Card */}
        <LinearGradient
          colors={isDark ? [colors.primary.muted, '#16281b'] : [colors.primary.muted, colors.background.card]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroRow}>
            <View style={styles.heroIconCircle}>
              <Text style={styles.heroIcon}>{getMaterialIcon(mat.slug)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroName}>{mat.name}</Text>
              <Text style={styles.heroType}>{mat.materialType}</Text>
            </View>
          </View>

          {mat.description && (
            <Text style={styles.heroDesc}>{mat.description}</Text>
          )}

          {/* Economics Bar */}
          {mat.approxCostMin && mat.approxCostMax && (
            <View style={styles.costBar}>
              <Text style={styles.costLabel}>Indicative Price (India Mandi / Export):</Text>
              <Text style={styles.costValue}>
                {mat.approxCostMin} – {mat.approxCostMax} {mat.costUnit ?? '₹/kg'}
              </Text>
            </View>
          )}

          {/* Sustainability Tags */}
          <View style={styles.heroBadgesRow}>
            {mat.recyclable && (
              <View style={[styles.ecoTag, { backgroundColor: isDark ? '#132a1a' : '#dcfce7', borderColor: isDark ? '#22c55e66' : '#86efac' }]}>
                <Text style={[styles.ecoTagText, { color: isDark ? '#4ade80' : '#15803d' }]}>♻️ 100% Recyclable</Text>
              </View>
            )}
            {mat.biodegradable && (
              <View style={[styles.ecoTag, { backgroundColor: isDark ? '#1f2e18' : '#ecfccb', borderColor: isDark ? '#84cc1666' : '#bef264' }]}>
                <Text style={[styles.ecoTagText, { color: isDark ? '#a3e635' : '#4d7c0f' }]}>🌱 Compostable</Text>
              </View>
            )}
            {mat.bioBased && (
              <View style={[styles.ecoTag, { backgroundColor: isDark ? '#142926' : '#d1fae5', borderColor: isDark ? '#10b98166' : '#6ee7b7' }]}>
                <Text style={[styles.ecoTagText, { color: isDark ? '#34d399' : '#047857' }]}>🌿 Bio-Based</Text>
              </View>
            )}
            {mat.monoMaterial && (
              <View style={[styles.ecoTag, { backgroundColor: isDark ? '#1c2438' : '#dbeafe', borderColor: isDark ? '#3b82f666' : '#93c5fd' }]}>
                <Text style={[styles.ecoTagText, { color: isDark ? '#60a5fa' : '#1d4ed8' }]}>🧱 Mono-Material Structure</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Barrier Properties Table */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Physical & Barrier Properties</Text>
            <View style={styles.astmBadge}>
              <Text style={styles.astmBadgeText}>ASTM / ISO</Text>
            </View>
          </View>
          <Text style={styles.sectionSub}>
            Standard laboratory gas permeability, moisture flux, and mechanical kinetics.
          </Text>

          {mat.properties && mat.properties.length > 0 ? (
            <View style={styles.propsList}>
              {mat.properties.map((prop, idx) => (
                <View
                  key={prop.id ?? idx}
                  style={[styles.propRow, idx === (mat.properties?.length ?? 1) - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.propName}>{getPropertyLabel(prop.propertyType)}</Text>
                    {(prop.testConditionTempC !== undefined || prop.testConditionRH !== undefined) && (
                      <Text style={styles.propCondition}>
                        Tested at {prop.testConditionTempC ?? 23}°C, {prop.testConditionRH ?? 0}% RH
                      </Text>
                    )}
                    {prop.notes && (
                      <Text style={styles.propNotes}>ℹ️ {prop.notes}</Text>
                    )}
                  </View>
                  <View style={styles.propValWrap}>
                    <Text style={styles.propValue}>{formatPropertyValue(prop)}</Text>
                    {prop.confidence && (
                      <View style={[
                        styles.confidenceBadge,
                        prop.confidence === 'HIGH' && { backgroundColor: isDark ? '#162e1c' : '#dcfce7' },
                      ]}>
                        <Text style={[
                          styles.confidenceText,
                          prop.confidence === 'HIGH' && { color: isDark ? '#4ade80' : '#15803d' },
                        ]}>
                          {prop.confidence} CONFIDENCE
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noPropsText}>No measured barrier properties available.</Text>
          )}
        </View>

        {/* Circular Economy & Regulatory Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Circular Economy & Compliance</Text>
          <Text style={styles.sectionSub}>
            MoFPI & Central Pollution Control Board (CPCB) plastic waste management framework.
          </Text>

          <View style={styles.complianceGrid}>
            <View style={styles.complianceItem}>
              <Text style={styles.complianceLabel}>Recycling Code</Text>
              <Text style={styles.complianceValue}>
                {mat.materialType === 'PET' ? 'RIC 1 (PETE)' : mat.materialType === 'HDPE' ? 'RIC 2 (HDPE)' : mat.materialType === 'LDPE' ? 'RIC 4 (LDPE)' : mat.materialType === 'PP' ? 'RIC 5 (PP)' : mat.biodegradable ? 'RIC 7 (PLA/Bio)' : 'RIC 7 (Other)'}
              </Text>
            </View>
            <View style={styles.complianceItem}>
              <Text style={styles.complianceLabel}>End-of-Life Stream</Text>
              <Text style={styles.complianceValue}>
                {mat.biodegradable ? 'Industrial Compost' : mat.recyclable ? 'Mechanical Recycling' : 'Energy Recovery / Upcycling'}
              </Text>
            </View>
            <View style={styles.complianceItem}>
              <Text style={styles.complianceLabel}>Food Contact Safe</Text>
              <Text style={styles.complianceValue}>FSSAI 2018 / FDA 21 CFR</Text>
            </View>
            <View style={styles.complianceItem}>
              <Text style={styles.complianceLabel}>EPR Multiplier</Text>
              <Text style={styles.complianceValue}>
                {mat.monoMaterial ? '1.0x (Standard)' : mat.recyclable ? '1.2x (Preferred)' : '1.5x (Multilayer)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Scientific References */}
        {mat.sources && mat.sources.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Scientific References & Citations</Text>
            <View style={styles.sourcesList}>
              {mat.sources.map((src, i) => (
                <Pressable
                  key={src.id ?? i}
                  style={styles.sourceItem}
                  onPress={() => {
                    if (src.url) Linking.openURL(src.url);
                  }}
                >
                  <Text style={styles.sourceCitation}>{src.citation}</Text>
                  {src.publication && (
                    <Text style={styles.sourcePub}>{src.publication} {src.year ? `(${src.year})` : ''}</Text>
                  )}
                  {src.url && (
                    <Text style={styles.sourceUrl}>🔗 {src.url}</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={styles.footerWrap}>
        <Pressable
          style={styles.analyzeBtn}
          onPress={handleStartAnalysis}
        >
          <Text style={styles.analyzeBtnText}>
            Analyze Packaging with this Material →
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background.DEFAULT,
    },
    topHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.xs,
      paddingBottom: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.background.border,
      gap: Spacing.sm,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.background.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backArrow: {
      color: colors.content.primary,
      fontSize: 20,
      fontFamily: 'Inter-Bold',
    },
    headerTitle: {
      fontSize: Typography.size.base,
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
    },
    headerSub: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
    },
    doneBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: BorderRadius.md,
      backgroundColor: isDark ? '#27231b' : '#f0ebdf',
    },
    doneText: {
      fontSize: 13,
      fontFamily: 'Inter-SemiBold',
      color: colors.primary.DEFAULT,
    },

    content: {
      padding: Spacing.md,
      gap: Spacing.md,
    },

    heroCard: {
      borderRadius: BorderRadius.xl,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: isDark ? '#2a4530' : colors.background.border,
      gap: Spacing.sm,
    },
    heroRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    heroIconCircle: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.lg,
      backgroundColor: isDark ? '#233d2a' : '#e6f3eb',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#386343' : '#c3e5cf',
    },
    heroIcon: {
      fontSize: 24,
    },
    heroName: {
      fontSize: Typography.size.lg,
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
    },
    heroType: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-Medium',
      color: colors.primary.DEFAULT,
      marginTop: 2,
    },
    heroDesc: {
      fontSize: Typography.size.sm,
      fontFamily: 'Inter-Regular',
      color: colors.content.secondary,
      lineHeight: 20,
    },
    costBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isDark ? '#112217' : '#edf7f0',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 6,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: isDark ? '#23442e' : '#cce8d6',
    },
    costLabel: {
      fontSize: 11,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
    },
    costValue: {
      fontSize: 12,
      fontFamily: 'Inter-Bold',
      color: isDark ? '#86efac' : '#15803d',
    },
    heroBadgesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 2,
    },
    ecoTag: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: BorderRadius.sm,
      borderWidth: 1,
    },
    ecoTagText: {
      fontSize: 11,
      fontFamily: 'Inter-Medium',
    },

    sectionCard: {
      backgroundColor: colors.background.card,
      borderRadius: BorderRadius.xl,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.background.border,
      gap: Spacing.xs,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: Typography.size.base,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.primary,
    },
    astmBadge: {
      backgroundColor: isDark ? '#27231b' : '#ede7dc',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    astmBadgeText: {
      fontSize: 9,
      fontFamily: 'Inter-Bold',
      color: colors.content.muted,
    },
    sectionSub: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
      lineHeight: 18,
      marginBottom: Spacing.xs,
    },

    propsList: {
      borderTopWidth: 1,
      borderTopColor: colors.background.border,
    },
    propRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#232018' : '#eee6d8',
      gap: Spacing.sm,
    },
    propName: {
      fontSize: Typography.size.sm,
      fontFamily: 'Inter-Medium',
      color: colors.content.primary,
    },
    propCondition: {
      fontSize: 11,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
      marginTop: 2,
    },
    propNotes: {
      fontSize: 11,
      fontFamily: 'Inter-Regular',
      color: isDark ? '#fbbf24' : '#b45309',
      marginTop: 2,
    },
    propValWrap: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    propValue: {
      fontSize: Typography.size.sm,
      fontFamily: 'Inter-Bold',
      color: colors.primary.DEFAULT,
    },
    confidenceBadge: {
      backgroundColor: isDark ? '#22201b' : '#eee8db',
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 2,
      marginTop: 3,
    },
    confidenceText: {
      fontSize: 8,
      fontFamily: 'Inter-Bold',
      color: colors.content.muted,
    },
    noPropsText: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
      paddingVertical: Spacing.sm,
    },

    complianceGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.xs,
      marginTop: Spacing.xs,
    },
    complianceItem: {
      width: '48%',
      backgroundColor: isDark ? '#16140f' : '#f5f0e6',
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      borderWidth: 1,
      borderColor: isDark ? '#26221a' : '#e6decb',
    },
    complianceLabel: {
      fontSize: 10,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
    },
    complianceValue: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.primary,
      marginTop: 2,
    },

    sourcesList: {
      marginTop: Spacing.xs,
      gap: Spacing.xs,
    },
    sourceItem: {
      backgroundColor: isDark ? '#16140f' : '#f5f0e6',
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      borderWidth: 1,
      borderColor: isDark ? '#26221a' : '#e6decb',
    },
    sourceCitation: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.primary,
    },
    sourcePub: {
      fontSize: 11,
      fontFamily: 'Inter-Regular',
      color: colors.content.secondary,
      marginTop: 2,
    },
    sourceUrl: {
      fontSize: 10,
      fontFamily: 'Inter-Regular',
      color: isDark ? '#60a5fa' : '#2563eb',
      marginTop: 4,
    },

    footerWrap: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background.DEFAULT,
      borderTopWidth: 1,
      borderTopColor: colors.background.border,
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.lg,
    },
    analyzeBtn: {
      backgroundColor: colors.primary.DEFAULT,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    analyzeBtnText: {
      fontSize: Typography.size.sm,
      fontFamily: 'Inter-Bold',
      color: isDark ? '#0b1f13' : '#ffffff',
    },

    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    loadingText: {
      fontSize: Typography.size.sm,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
    },
  });
}
