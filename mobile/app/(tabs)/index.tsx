/**
 * Dashboard — mirrors apps/web/src/app/(app)/dashboard/page.tsx
 *
 * Sections (same as web):
 *  1. Hero gradient card
 *  2. 4-col stat row (real data from API)
 *  3. "What are you packaging?" — category pills + real food grid
 *  4. Start New Analysis — module cards (Fresh Produce / Other Commodities)
 *  5. Recent Analyses — real list from API with COMPLETED badge
 *  6. Quick Actions — 2×2 grid
 */
import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/hooks/useAuth';
import { analysisApi, foodsApi, type AnalysisResult, type FoodItem, type FoodCategory } from '@/lib/api/analysis';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  useAppTheme,
  type ThemeColors,
} from '@/constants/colors';

import { useLanguageStore, getFoodName, getCategoryName, getStorageLabel, getStatusLabel, t, getBrandName } from '@/lib/i18n/language-store';
import { useSidebarStore } from '@/hooks/useSidebarStore';

const FOOD_EMOJI_MAP: Record<string, string> = {
  apple: '🍎', banana: '🍌', mango: '🥭', tomato: '🍅', potato: '🥔',
  spinach: '🌿', onion: '🧅', wheat: '🌾', carrot: '🥕', rice: '🍚',
  coffee: '☕', biscuits: '🍪', grapes: '🍇', cashew: '🥜', corn: '🌽',
  orange: '🍊', lemon: '🍋', strawberry: '🍓', blueberry: '🫐', broccoli: '🥦',
  cauliflower: '🥦', cabbage: '🥬', lettuce: '🥬', cucumber: '🥒', pepper: '🫑',
  chilli: '🌶️', garlic: '🧄', ginger: '🫚', turmeric: '🟡', coriander: '🌿',
  milk: '🥛', cheese: '🧀', yogurt: '🥛', butter: '🧈', paneer: '🧀',
  lentils: '🫘', chickpeas: '🫘', soybeans: '🫘', peas: '🟢', beans: '🫘',
  'cashew-nut': '🥜', peanut: '🥜', almond: '🌰', walnut: '🌰',
  flour: '🌾', sugar: '🍬', salt: '🧂',
};

function getFoodEmoji(slug: string, categorySlug?: string) {
  return FOOD_EMOJI_MAP[slug] ?? (categorySlug === 'fruits' ? '🍑' : categorySlug === 'vegetables' ? '🥦' : '📦');
}

function getStatusColor(status: string) {
  switch (status) {
    case 'COMPLETED': return '#22c55e';
    case 'FAILED': return '#ef4444';
    case 'PROCESSING': return '#f59e0b';
    default: return '#6b7280';
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { locale } = useLanguageStore();
  const { openSidebar } = useSidebarStore();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [refreshing, setRefreshing] = useState(false);

  const { data: analysesData, isLoading: analysesLoading, refetch: refetchAnalyses } = useQuery({
    queryKey: ['analysis', 'recent'],
    queryFn: () => analysisApi.list({ limit: 6 }),
  });

  useFocusEffect(
    useCallback(() => {
      refetchAnalyses();
    }, [refetchAnalyses])
  );

  const { data: foodsData, isLoading: foodsLoading, refetch: refetchFoods } = useQuery({
    queryKey: ['foods', selectedCategory],
    queryFn: () => foodsApi.list({ categorySlug: selectedCategory }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['food-categories'],
    queryFn: () => foodsApi.categories(),
  });

  const recent = (analysesData?.data ?? []).slice(0, 6);
  const totalAnalyses = analysesData?.total ?? 0;
  const foods = (foodsData?.data ?? []).slice(0, 8);
  const categories: FoodCategory[] = categoriesData?.data ?? [];
  const commoditiesAnalyzed = new Set(recent.map((a) => a.food?.id)).size;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchAnalyses(), refetchFoods()]);
    setRefreshing(false);
  }, [refetchAnalyses, refetchFoods]);

  const goAnalysis = (food?: FoodItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (food) {
      router.push(`/analysis/wizard/step-0-food?food=${food.slug}`);
    } else {
      router.push('/analysis/wizard/step-0-food');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Top Bar with Sidebar Drawer (☰) and Settings (⚙️) ── */}
      <View style={styles.topAppBar}>
        <Pressable
          style={styles.topIconBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openSidebar();
          }}
          hitSlop={12}
        >
          <Text style={styles.topHamburger}>☰</Text>
        </Pressable>
        <View style={styles.topBrandCenter}>
          <Text style={styles.topBrandIcon}>🌱</Text>
          <Text style={styles.topBrandName}>FoodPack AI</Text>
        </View>
        <Pressable
          style={styles.topIconBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.navigate('/(tabs)/settings');
          }}
          hitSlop={12}
        >
          <Text style={styles.topGearIcon}>⚙️</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.DEFAULT}
          />
        }
      >
        {/* ── Hero Card ── */}
        <Pressable onPress={() => goAnalysis()} style={styles.heroWrap}>
          <LinearGradient
            colors={[colors.primary.DEFAULT, colors.primary.dark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            {/* Settings icon top-right */}
            <Pressable
              style={styles.heroSettings}
              onPress={() => router.push('/(tabs)/more')}
            >
              <Text style={styles.heroSettingsIcon}>⚙</Text>
            </Pressable>

            <View style={styles.heroBadgeWrap}>
              <Text style={styles.heroBadgeText}>{t('ai_assisted_science_backed', locale)}</Text>
            </View>

            <Text style={styles.heroTitle}>
              {t('welcome_title', locale)}.{'\n'}{getBrandName(locale)}
            </Text>
            <Text style={styles.heroSubtitle}>
              {t('tagline', locale)}
            </Text>

            <Pressable
              style={styles.heroBtn}
              onPress={() => goAnalysis()}
            >
              <Text style={styles.heroBtnText}>{t('new_analysis', locale)} →</Text>
            </Pressable>
          </LinearGradient>
        </Pressable>

        {/* ── Stat Row ── */}
        <View style={styles.statsRow}>
          {[
            { label: t('analyses_run', locale), value: totalAnalyses },
            { label: t('saved_projects', locale), value: 0 },
            { label: t('commodities_stat', locale), value: commoditiesAnalyzed },
            { label: t('reports_stat', locale), value: 0 },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ── What are you packaging? ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('quick_select', locale)}</Text>
            <Pressable onPress={() => router.push('/(tabs)/foods')}>
              <Text style={styles.viewAll}>{t('view_all', locale)}</Text>
            </Pressable>
          </View>

          {/* Category pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
            style={styles.pillsScroll}
          >
            <Pressable
              onPress={() => setSelectedCategory(undefined)}
              style={[styles.pill, !selectedCategory && styles.pillActive]}
            >
              <Text style={[styles.pillText, !selectedCategory && styles.pillTextActive]}>{t('all', locale)}</Text>
            </Pressable>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.slug === selectedCategory ? undefined : cat.slug)}
                style={[styles.pill, selectedCategory === cat.slug && styles.pillActive]}
              >
                <Text style={[styles.pillText, selectedCategory === cat.slug && styles.pillTextActive]}>
                  {getCategoryName(cat, locale)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Food grid */}
          {foodsLoading ? (
            <View style={styles.foodGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <View key={i} style={[styles.foodItem, styles.foodItemSkeleton]} />
              ))}
            </View>
          ) : (
            <View style={styles.foodGrid}>
              {foods.map((food) => (
                <Pressable
                  key={food.id}
                  style={({ pressed }) => [styles.foodItem, pressed && styles.pressed]}
                  onPress={() => goAnalysis(food)}
                >
                  <View style={styles.foodCircle}>
                    <Text style={styles.foodEmoji}>
                      {getFoodEmoji(food.slug, food.category?.slug)}
                    </Text>
                  </View>
                  <Text style={styles.foodName} numberOfLines={1}>{getFoodName(food, locale)}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* ── Start New Analysis ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('start_new_analysis', locale)}</Text>
          <Text style={styles.cardSubtitle}>
            {t('start_analysis_desc', locale)}
          </Text>

          {/* Fresh Produce */}
          <Pressable
            style={({ pressed }) => [styles.moduleCard, styles.moduleCardGreen, pressed && styles.pressed]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/analysis/wizard/step-0-food');
            }}
          >
            <View style={styles.moduleIconGreen}>
              <Text style={styles.moduleIconText}>🌿</Text>
            </View>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleTitle}>{t('fresh_fruits_veg', locale)}</Text>
              <Text style={styles.moduleDesc}>{t('fresh_produce_desc', locale)}</Text>
            </View>
            <Text style={styles.moduleArrow}>›</Text>
          </Pressable>

          {/* Other Commodities */}
          <Pressable
            style={({ pressed }) => [styles.moduleCard, styles.moduleCardBlue, pressed && styles.pressed]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/analysis/wizard/step-0-food');
            }}
          >
            <View style={styles.moduleIconBlue}>
              <Text style={styles.moduleIconText}>📦</Text>
            </View>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleTitle}>{t('other_food_commodities', locale)}</Text>
              <Text style={styles.moduleDesc}>{t('other_food_desc', locale)}</Text>
            </View>
            <Text style={styles.moduleArrow}>›</Text>
          </Pressable>

          <Pressable onPress={() => router.push('/(tabs)/analysis')}>
            <Text style={styles.notSure}>{t('not_sure_guide', locale)}</Text>
          </Pressable>
        </View>

        {/* ── Recent Analyses ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('recent_analyses', locale)}</Text>

          {analysesLoading && (
            <View>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.recentSkeleton} />
              ))}
            </View>
          )}

          {!analysesLoading && recent.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No analyses yet</Text>
              <Text style={styles.emptyDesc}>
                Start your first analysis to get AI-powered packaging recommendations.
              </Text>
              <Pressable
                style={styles.emptyBtn}
                onPress={() => goAnalysis()}
              >
                <LinearGradient
                  colors={['#22c55e', '#16a34a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.emptyBtnGrad}
                >
                  <Text style={styles.emptyBtnText}>Start First Analysis</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {recent.map((a) => (
            <Pressable
              key={a.id}
              style={({ pressed }) => [styles.recentItem, pressed && styles.pressed]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/analysis/${a.id}/results`);
              }}
            >
              <View style={styles.recentItemRow}>
                <View style={styles.recentLeft}>
                  <View style={styles.recentTitleRow}>
                    <Text style={styles.recentFoodName}>{getFoodName(a.food, locale) || 'Unknown'}</Text>
                    <View style={styles.recentModulePill}>
                      <Text style={styles.recentModuleText}>
                        {a.food?.isFreshProduce ? t('fresh_produce_badge', locale) : t('other_commodity_badge', locale)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.recentMeta}>
                    {getStorageLabel(a.storageType, locale)} · {a.targetShelfLifeDays} {t('days_target', locale)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(a.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(a.status) }]}>
                    {getStatusLabel(a.status, locale)}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('quick_actions', locale)}</Text>
          <View style={styles.qaGrid}>
            {[
              { label: t('new_analysis', locale), icon: '＋', onPress: () => goAnalysis() },
              { label: t('food_database', locale), icon: '🌿', onPress: () => router.push('/(tabs)/foods') },
              { label: t('materials', locale), icon: '📦', onPress: () => router.push('/materials') },
              { label: t('reports', locale), icon: '📄', onPress: () => router.push('/(tabs)/history') },
            ].map((a) => (
              <Pressable
                key={a.label}
                style={({ pressed }) => [styles.qaItem, pressed && styles.pressed]}
                onPress={a.onPress}
              >
                <Text style={styles.qaIcon}>{a.icon}</Text>
                <Text style={styles.qaLabel}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (C: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.background.DEFAULT },
    scroll: { flex: 1 },
    scrollContent: { padding: Spacing.md, gap: 16 },

    /* Hero */
    heroWrap: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
    hero: { padding: 20, gap: 12, borderRadius: BorderRadius.xl, position: 'relative' },
    heroSettings: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(0,0,0,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    heroSettingsIcon: { fontSize: 16, color: '#fff' },
    heroBadgeWrap: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.18)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginBottom: 4,
    },
    heroBadgeText: { fontSize: 11, color: '#fff', fontFamily: 'Inter-Medium' },
    heroTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: '#fff',
      lineHeight: 27,
    },
    heroSubtitle: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.85)',
      fontFamily: 'Inter-Regular',
      lineHeight: 19,
    },
    heroBtn: {
      alignSelf: 'flex-start',
      backgroundColor: '#fff',
      borderRadius: BorderRadius.lg,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginTop: 4,
    },
    heroBtnText: { fontSize: 13, color: C.primary.dark, fontFamily: 'Inter-SemiBold' },

    /* Stats */
    statsRow: { flexDirection: 'row', gap: 8 },
    statCard: {
      flex: 1,
      backgroundColor: C.background.card,
      borderRadius: BorderRadius.lg,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: C.background.border,
      alignItems: 'flex-start',
    },
    statValue: { fontSize: 22, fontFamily: 'Inter-Bold', color: C.content.primary },
    statLabel: { fontSize: 10, color: C.content.muted, fontFamily: 'Inter-Regular', marginTop: 2 },

    /* Section */
    section: { gap: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: C.content.primary },
    viewAll: { fontSize: 13, color: C.primary.DEFAULT, fontFamily: 'Inter-Medium' },

    /* Category Pills */
    pillsScroll: { marginHorizontal: -Spacing.md },
    pillsRow: { paddingHorizontal: Spacing.md, gap: 8, flexDirection: 'row' },
    pill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: C.background.card,
      borderWidth: 1,
      borderColor: C.background.border,
    },
    pillActive: { backgroundColor: C.primary.DEFAULT, borderColor: C.primary.DEFAULT },
    pillText: { fontSize: 12, fontFamily: 'Inter-Medium', color: C.content.secondary },
    pillTextActive: { color: C.primary.foreground || '#fff' },

    /* Food Grid */
    foodGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    foodItem: {
      width: '11%',
      minWidth: 72,
      flex: 1,
      alignItems: 'center',
      gap: 6,
    },
    foodItemSkeleton: {
      height: 80,
      backgroundColor: C.background.card,
      borderRadius: BorderRadius.md,
    },
    foodCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: C.background.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: C.background.border,
    },
    foodEmoji: { fontSize: 24 },
    foodName: { fontSize: 11, color: C.content.secondary, fontFamily: 'Inter-Medium', textAlign: 'center' },

    /* Card */
    card: {
      backgroundColor: C.background.card,
      borderRadius: BorderRadius.xl,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: C.background.border,
    },
    cardTitle: { fontSize: 15, fontFamily: 'Inter-SemiBold', color: C.content.primary },
    cardSubtitle: { fontSize: 12, color: C.content.muted, fontFamily: 'Inter-Regular', lineHeight: 18 },

    /* Module Cards */
    moduleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
    },
    moduleCardGreen: {
      backgroundColor: C.primary.muted,
      borderColor: C.primary.subtleBorder,
    },
    moduleCardBlue: {
      backgroundColor: 'rgba(59,130,246,0.08)',
      borderColor: 'rgba(59,130,246,0.2)',
    },
    moduleIconGreen: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: C.primary.DEFAULT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moduleIconBlue: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: '#3b82f6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    moduleIconText: { fontSize: 18 },
    moduleInfo: { flex: 1 },
    moduleTitle: { fontSize: 13, fontFamily: 'Inter-SemiBold', color: C.content.primary },
    moduleDesc: { fontSize: 11, color: C.content.muted, fontFamily: 'Inter-Regular', marginTop: 2 },
    moduleArrow: { fontSize: 20, color: C.content.muted, fontFamily: 'Inter-Regular' },
    notSure: { fontSize: 12, color: C.content.muted, fontFamily: 'Inter-Regular', marginTop: 4 },

    /* Recent Analyses */
    recentSkeleton: {
      height: 56,
      backgroundColor: C.background.border,
      borderRadius: BorderRadius.md,
      marginBottom: 8,
    },
    recentItem: {
      padding: 12,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: C.background.border,
      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : C.background.card,
      marginBottom: 8,
    },
    recentItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    recentLeft: { flex: 1 },
    recentTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
    recentFoodName: { fontSize: 13, fontFamily: 'Inter-SemiBold', color: C.content.primary },
    recentModulePill: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : C.background.elevated,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    recentModuleText: { fontSize: 10, color: C.content.muted, fontFamily: 'Inter-Regular' },
    recentMeta: { fontSize: 11, color: C.content.muted, fontFamily: 'Inter-Regular' },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginLeft: 8,
    },
    statusText: { fontSize: 10, fontFamily: 'Inter-SemiBold' },

    /* Empty state */
    emptyState: { alignItems: 'center', paddingVertical: 24, gap: 8 },
    emptyIcon: { fontSize: 40 },
    emptyTitle: { fontSize: 16, fontFamily: 'Inter-SemiBold', color: C.content.primary },
    emptyDesc: { fontSize: 13, color: C.content.muted, textAlign: 'center', lineHeight: 19 },
    emptyBtn: { marginTop: 8, borderRadius: BorderRadius.lg, overflow: 'hidden' },
    emptyBtnGrad: { paddingHorizontal: 20, paddingVertical: 12 },
    emptyBtnText: { color: '#fff', fontFamily: 'Inter-SemiBold', fontSize: 14 },

    /* Quick Actions */
    qaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    qaItem: {
      flex: 1,
      minWidth: '45%',
      alignItems: 'center',
      gap: 8,
      padding: 16,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: C.background.border,
      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : C.background.card,
    },
    qaIcon: { fontSize: 22 },
    qaLabel: { fontSize: 12, fontFamily: 'Inter-Medium', color: C.content.secondary, textAlign: 'center' },

    /* Top App Bar with Sidebar Menu */
    topAppBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.xs,
      paddingBottom: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: C.background.border,
    },
    topIconBtn: {
      width: 38,
      height: 38,
      borderRadius: BorderRadius.md,
      backgroundColor: C.background.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: C.background.border,
    },
    topHamburger: {
      fontSize: 20,
      color: C.content.primary,
    },
    topBrandCenter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    topBrandIcon: {
      fontSize: 18,
    },
    topBrandName: {
      fontSize: 16,
      fontFamily: 'Inter-Bold',
      color: C.content.primary,
    },
    topGearIcon: {
      fontSize: 16,
    },

    pressed: { opacity: 0.7 },
  });
