/**
 * Packaging Materials Catalog — Full parity with web /materials
 *
 * Features:
 *  - Live search across material names, descriptions, and polymer types
 *  - Material filter categories (All, High Barrier, Flexible Films, Bio & Compostable, Bulk / Rigid)
 *  - Material summary cards with barrier metrics (OTR, WVTR, Thickness, Cost)
 *  - Circular economy tags (Recyclable, Biodegradable, Mono-Material, Bio-based)
 *  - Fast offline fallback with zero network required
 *  - One-tap navigation to deep scientific detail screen
 */
import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { materialsApi, type LayerMaterial } from '@/lib/api/analysis';
import { Spacing, BorderRadius, Typography } from '@/constants/colors';
import { useAppTheme, type ThemeColors } from '@/lib/theme/theme-store';
import { useLanguageStore, t } from '@/lib/i18n/language-store';
import { useSidebarStore } from '@/hooks/useSidebarStore';

type FilterCategory = 'ALL' | 'BARRIER' | 'FLEXIBLE' | 'BIO' | 'BULK';

interface FilterOption {
  id: FilterCategory;
  label: string;
  icon: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'ALL', label: 'All Materials', icon: '📦' },
  { id: 'BARRIER', label: 'High Barrier', icon: '🛡️' },
  { id: 'FLEXIBLE', label: 'Flexible Films', icon: '📜' },
  { id: 'BIO', label: 'Bio & Compostable', icon: '🌱' },
  { id: 'BULK', label: 'Bulk & Rigid', icon: '🏗️' },
];

function getCategoryForMaterial(mat: LayerMaterial): FilterCategory {
  const type = mat.materialType ?? '';
  if (mat.biodegradable || mat.compostable || mat.bioBased) return 'BIO';
  if (['ALU_FOIL_LAMINATE', 'METALLIZED_FILM', 'MULTILAYER_FILM'].includes(type)) return 'BARRIER';
  if (['WOVEN_PP', 'JUTE', 'CORRUGATED_FIBERBOARD', 'VENTED_CRATE', 'PET'].includes(type) && (mat.slug.includes('tray') || mat.slug.includes('crate') || mat.slug.includes('sack') || mat.slug.includes('corrugated') || mat.slug.includes('jute'))) {
    return 'BULK';
  }
  return 'FLEXIBLE';
}

function getMaterialIcon(mat: LayerMaterial): string {
  const slug = mat.slug.toLowerCase();
  if (slug.includes('alu') || slug.includes('foil')) return '🪙';
  if (slug.includes('met-') || slug.includes('metallized')) return '✨';
  if (slug.includes('pla') || slug.includes('cellulose')) return '🌱';
  if (slug.includes('jute')) return '🌾';
  if (slug.includes('crate')) return '🧺';
  if (slug.includes('tray')) return '🍱';
  if (slug.includes('corrugated') || slug.includes('board')) return '📦';
  if (slug.includes('sack') || slug.includes('woven')) return '🛍️';
  if (slug.includes('perf')) return '💨';
  if (slug.includes('evoh') || slug.includes('bopa')) return '🛡️';
  return '📜';
}

export default function MaterialsScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { locale } = useLanguageStore();
  const { openSidebar } = useSidebarStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('ALL');

  const {
    data: materialsData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['materials', search, selectedCategory],
    queryFn: () => materialsApi.list({ search: search.trim() || undefined }),
  });

  const materials = useMemo(() => {
    let list = materialsData?.data ?? [];
    if (selectedCategory !== 'ALL') {
      list = list.filter((m) => {
        const cat = getCategoryForMaterial(m);
        return cat === selectedCategory;
      });
    }
    return list;
  }, [materialsData, selectedCategory]);

  const handleSelectMaterial = (mat: LayerMaterial) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/materials/[slug]',
      params: { slug: mat.slug },
    });
  };

  const renderMaterialCard = ({ item }: { item: LayerMaterial }) => {
    const otr = item.properties?.find((p) => p.propertyType === 'OTR');
    const wvtr = item.properties?.find((p) => p.propertyType === 'WVTR');
    const thickness = item.properties?.find((p) => p.propertyType === 'THICKNESS');

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => handleSelectMaterial(item)}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Text style={styles.materialIcon}>{getMaterialIcon(item)}</Text>
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            </View>
            <View style={styles.metaRow}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{item.materialType ?? 'FILM'}</Text>
              </View>
              {item.approxCostMin && item.approxCostMax && (
                <Text style={styles.costBadge}>
                  {item.approxCostMin}–{item.approxCostMax} {item.costUnit ?? '₹/kg'}
                </Text>
              )}
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>

        {/* Description */}
        {item.description && (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Barrier & Physical Metric Pills */}
        <View style={styles.metricsRow}>
          {otr && (
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>OTR</Text>
              <Text style={styles.metricVal}>
                {otr.minValue === 0 ? '< 0.1' : otr.minValue ?? otr.value}
                <Text style={styles.metricUnit}> cc</Text>
              </Text>
            </View>
          )}
          {wvtr && (
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>WVTR</Text>
              <Text style={styles.metricVal}>
                {wvtr.minValue === 0 ? '< 0.1' : wvtr.minValue ?? wvtr.value}
                <Text style={styles.metricUnit}> g</Text>
              </Text>
            </View>
          )}
          {thickness && (
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>Gauge</Text>
              <Text style={styles.metricVal}>
                {thickness.minValue && thickness.maxValue
                  ? `${thickness.minValue}–${thickness.maxValue}`
                  : `${thickness.value ?? thickness.minValue}`}
                <Text style={styles.metricUnit}> µm</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Eco & Sustainability Badges */}
        <View style={styles.badgesRow}>
          {item.recyclable && (
            <View style={[styles.ecoBadge, { backgroundColor: isDark ? '#132a1a' : '#dcfce7', borderColor: isDark ? '#22c55e44' : '#86efac' }]}>
              <Text style={[styles.ecoBadgeText, { color: isDark ? '#4ade80' : '#15803d' }]}>♻️ Recyclable</Text>
            </View>
          )}
          {item.biodegradable && (
            <View style={[styles.ecoBadge, { backgroundColor: isDark ? '#1f2e18' : '#ecfccb', borderColor: isDark ? '#84cc1644' : '#bef264' }]}>
              <Text style={[styles.ecoBadgeText, { color: isDark ? '#a3e635' : '#4d7c0f' }]}>🌱 Compostable</Text>
            </View>
          )}
          {item.bioBased && (
            <View style={[styles.ecoBadge, { backgroundColor: isDark ? '#142926' : '#d1fae5', borderColor: isDark ? '#10b98144' : '#6ee7b7' }]}>
              <Text style={[styles.ecoBadgeText, { color: isDark ? '#34d399' : '#047857' }]}>🌿 Bio-Based</Text>
            </View>
          )}
          {item.monoMaterial && (
            <View style={[styles.ecoBadge, { backgroundColor: isDark ? '#1c2438' : '#dbeafe', borderColor: isDark ? '#3b82f644' : '#93c5fd' }]}>
              <Text style={[styles.ecoBadgeText, { color: isDark ? '#60a5fa' : '#1d4ed8' }]}>🧱 Mono-Material</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Pressable
          style={styles.menuBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openSidebar();
          }}
          hitSlop={12}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t('packaging_materials_title', locale)}</Text>
          <Text style={styles.headerSub}>{t('packaging_materials_desc', locale)}</Text>
        </View>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Text style={styles.backText}>✕</Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search materials, barrier types, polymers..."
          placeholderTextColor={colors.content.muted}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={10}>
            <Text style={styles.clearIcon}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Category Filter Chips */}
      <View style={styles.chipsScrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTER_OPTIONS.map((f) => {
            const isActive = selectedCategory === f.id;
            return (
              <Pressable
                key={f.id}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(f.id);
                }}
              >
                <Text style={styles.chipIcon}>{f.icon}</Text>
                <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Header */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {materials.length} {materials.length === 1 ? 'material' : 'materials'} available
        </Text>
        <Text style={styles.countSub}>Validated ASTM / ISO barrier properties</Text>
      </View>

      {/* Material List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading scientific barrier catalog...</Text>
        </View>
      ) : materials.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={styles.emptyTitle}>No matching materials found</Text>
          <Text style={styles.emptySub}>
            Try changing your search term or select another category filter.
          </Text>
          <Pressable
            style={styles.resetBtn}
            onPress={() => {
              setSearch('');
              setSelectedCategory('ALL');
            }}
          >
            <Text style={styles.resetBtnText}>Reset Filters</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={materials}
          keyExtractor={(item) => item.id}
          renderItem={renderMaterialCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary.DEFAULT}
            />
          }
        />
      )}
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
    menuBtn: {
      width: 38,
      height: 38,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.background.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuIcon: {
      color: colors.content.primary,
      fontSize: 18,
      lineHeight: 20,
    },
    headerTitle: {
      fontSize: Typography.size.lg,
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
    },
    headerSub: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
    },
    backBtn: {
      width: 34,
      height: 34,
      borderRadius: BorderRadius.full,
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.background.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backText: {
      fontSize: 15,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.secondary,
    },

    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.background.border,
      borderRadius: BorderRadius.lg,
      marginHorizontal: Spacing.md,
      marginTop: Spacing.sm,
      paddingHorizontal: Spacing.sm,
      height: 44,
    },
    searchIcon: {
      fontSize: 16,
      marginRight: Spacing.xs,
    },
    searchInput: {
      flex: 1,
      fontSize: Typography.size.sm,
      fontFamily: 'Inter-Regular',
      color: colors.content.primary,
      paddingVertical: 0,
    },
    clearIcon: {
      fontSize: 14,
      color: colors.content.muted,
      paddingHorizontal: 4,
    },

    chipsScrollWrap: {
      marginTop: Spacing.sm,
    },
    chipsRow: {
      paddingHorizontal: Spacing.md,
      gap: Spacing.xs,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.background.border,
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 6,
      gap: 4,
    },
    chipActive: {
      backgroundColor: isDark ? colors.primary.muted : '#eef8f2',
      borderColor: colors.primary.DEFAULT,
    },
    chipIcon: {
      fontSize: 13,
    },
    chipLabel: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-Medium',
      color: colors.content.secondary,
    },
    chipLabelActive: {
      color: colors.primary.DEFAULT,
      fontFamily: 'Inter-SemiBold',
    },

    countRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.xs,
    },
    countText: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.secondary,
    },
    countSub: {
      fontSize: 10,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
    },

    listContent: {
      paddingHorizontal: Spacing.md,
      paddingBottom: Spacing['3xl'],
      gap: Spacing.sm,
    },
    card: {
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.background.border,
      borderRadius: BorderRadius.xl,
      padding: Spacing.md,
      gap: Spacing.xs,
    },
    cardPressed: {
      opacity: 0.85,
      backgroundColor: isDark ? '#1f1c15' : '#f0ebdf',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.lg,
      backgroundColor: isDark ? '#27231b' : '#f3ede1',
      borderWidth: 1,
      borderColor: colors.background.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    materialIcon: {
      fontSize: 20,
    },
    headerInfo: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cardTitle: {
      fontSize: Typography.size.base,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.primary,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginTop: 2,
    },
    typeBadge: {
      backgroundColor: isDark ? '#232018' : '#f4eee3',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: BorderRadius.sm,
      borderWidth: 1,
      borderColor: colors.background.border,
    },
    typeBadgeText: {
      fontSize: 9,
      fontFamily: 'Inter-Medium',
      color: colors.content.muted,
    },
    costBadge: {
      fontSize: 10,
      fontFamily: 'Inter-Regular',
      color: colors.content.secondary,
    },
    chevron: {
      fontSize: 20,
      color: colors.content.muted,
      fontFamily: 'Inter-Regular',
      marginLeft: 4,
    },

    cardDesc: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-Regular',
      color: colors.content.secondary,
      lineHeight: 18,
      marginTop: 2,
    },

    metricsRow: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#12110c' : '#f5f0e6',
      borderRadius: BorderRadius.md,
      padding: Spacing.xs,
      gap: Spacing.sm,
      marginTop: Spacing.xs,
      borderWidth: 1,
      borderColor: isDark ? '#232018' : '#e8decb',
    },
    metricPill: {
      flex: 1,
      alignItems: 'center',
    },
    metricLabel: {
      fontSize: 9,
      fontFamily: 'Inter-Medium',
      color: colors.content.muted,
      textTransform: 'uppercase',
    },
    metricVal: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
      marginTop: 1,
    },
    metricUnit: {
      fontSize: 9,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
    },

    badgesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4,
    },
    ecoBadge: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: BorderRadius.sm,
      borderWidth: 1,
    },
    ecoBadgeText: {
      fontSize: 10,
      fontFamily: 'Inter-Medium',
    },

    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingBottom: Spacing['3xl'],
    },
    loadingText: {
      fontSize: Typography.size.sm,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
    },

    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xl,
      paddingBottom: Spacing['3xl'],
      gap: Spacing.xs,
    },
    emptyEmoji: {
      fontSize: 48,
      marginBottom: Spacing.xs,
    },
    emptyTitle: {
      fontSize: Typography.size.base,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.primary,
    },
    emptySub: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
      textAlign: 'center',
      lineHeight: 18,
      maxWidth: 280,
    },
    resetBtn: {
      marginTop: Spacing.md,
      backgroundColor: isDark ? colors.primary.muted : '#eef8f2',
      borderColor: colors.primary.DEFAULT,
      borderWidth: 1,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
    },
    resetBtnText: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-SemiBold',
      color: colors.primary.DEFAULT,
    },
  });
}
