/**
 * Food Database — mirrors apps/web/src/app/(app)/foods/page.tsx
 *
 * Features:
 *  - Search bar
 *  - Category filter pills
 *  - Food grid with emoji, name, category, freshProduce badge
 *  - Tap to view comprehensive scientific details modal (properties, storage, shelf-life, citations)
 *  - One-tap "Analyze Packaging" to launch the deterministic recommendation wizard
 */
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
  Dimensions,
  Animated,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import {
  foodsApi,
  type FoodItem,
  type FoodCategory,
  type FoodDetailItem,
} from '@/lib/api/analysis';
import { useAppTheme, type ThemeColors, Spacing, BorderRadius, Typography } from '@/constants/colors';
import {
  useLanguageStore,
  getFoodName,
  getCategoryName,
  getStorageLabel,
  t,
} from '@/lib/i18n/language-store';
import { useSidebarStore } from '@/hooks/useSidebarStore';
import { formatValue } from '@/lib/property-helpers';

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

function getPropertyTitle(propType: string): string {
  const map: Record<string, string> = {
    MOISTURE_CONTENT: 'Moisture Content',
    PH: 'pH Level',
    WATER_ACTIVITY: 'Water Activity (aw)',
    RESPIRATION_RATE: 'Respiration Rate (R_CO₂)',
    FAT_CONTENT: 'Fat Content',
    PROTEIN_CONTENT: 'Protein Content',
    ETHYLENE_PRODUCTION: 'Ethylene Production',
    ETHYLENE_SENSITIVITY: 'Ethylene Sensitivity',
    CHILLING_SENSITIVITY: 'Chilling Sensitivity',
  };
  return map[propType] ?? propType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function FoodCard({
  food,
  locale,
  onPress,
  styles,
}: {
  food: FoodItem;
  locale: any;
  onPress: () => void;
  styles: any;
}) {
  return (
    <Pressable
      style={({ pressed }) => [{ flex: 1 }, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.foodCard}>
        <View style={styles.foodEmojiCircle}>
          <Text style={styles.foodEmoji}>{getFoodEmoji(food.slug, food.category?.slug)}</Text>
        </View>
        <Text style={styles.foodName} numberOfLines={2}>{getFoodName(food, locale)}</Text>
        <Text style={styles.foodCategory} numberOfLines={1}>{getCategoryName(food.category, locale)}</Text>
        <View style={styles.cardBottomRow}>
          {food.isFreshProduce && (
            <View style={styles.freshBadge}>
              <Text style={styles.freshBadgeText}>{t('fresh_produce_badge', locale)}</Text>
            </View>
          )}
          <Text style={styles.viewDetailsText}>Details →</Text>
        </View>
      </View>
    </Pressable>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

function FoodDetailModal({
  slug,
  visible,
  onClose,
  onStartAnalysis,
  locale,
}: {
  slug: string | null;
  visible: boolean;
  onClose: () => void;
  onStartAnalysis: (slug: string) => void;
  locale: any;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['food-detail', slug],
    queryFn: () => (slug ? foodsApi.byId(slug) : null),
    enabled: !!slug && visible,
  });

  const { colors, isDark } = useAppTheme();
  const modalStyles = useMemo(() => createModalStyles(colors, isDark), [colors, isDark]);

  const food: FoodDetailItem | null | undefined = data?.data;
  const [mounted, setMounted] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMounted(false);
      });
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => backHandler.remove();
  }, [visible, onClose]);

  if (!mounted && !visible) return null;

  return (
    <View style={modalStyles.overlayContainer} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[modalStyles.backdrop, { opacity: backdropAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          modalStyles.sheetWrap,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={modalStyles.safe}>
          {/* Top Header */}
          <View style={modalStyles.header}>
            <Pressable style={modalStyles.closeBtn} onPress={onClose} hitSlop={12}>
              <Text style={modalStyles.closeText}>✕</Text>
            </Pressable>
            <Text style={modalStyles.headerTitle}>{t('food_details', locale)}</Text>
            <View style={{ width: 36 }} />
          </View>

        {isLoading || !food ? (
          <View style={modalStyles.loadingWrap}>
            <ActivityIndicator color={colors.primary.DEFAULT} size="large" />
            <Text style={modalStyles.loadingText}>{t('loading_foods', locale)}</Text>
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={modalStyles.content}
          >
            {/* Food Hero */}
            <View style={modalStyles.heroCard}>
              <View style={modalStyles.heroIconWrap}>
                <Text style={modalStyles.heroEmoji}>
                  {getFoodEmoji(food.slug, food.category?.slug)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.foodName}>{getFoodName(food, locale)}</Text>
                {food.scientificName && (
                  <Text style={modalStyles.scientificName}>
                    {food.scientificName}
                  </Text>
                )}
                <View style={modalStyles.badgesRow}>
                  <View style={modalStyles.categoryBadge}>
                    <Text style={modalStyles.categoryBadgeText}>
                      {getCategoryName(food.category, locale)}
                    </Text>
                  </View>
                  {food.isFreshProduce && (
                    <View style={modalStyles.freshBadge}>
                      <Text style={modalStyles.freshBadgeText}>
                        {t('fresh_produce_badge', locale)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Common names */}
            {food.commonNames && food.commonNames.length > 0 && (
              <View style={modalStyles.infoBox}>
                <Text style={modalStyles.infoLabel}>{t('also_known_as', locale)}:</Text>
                <Text style={modalStyles.infoVal}>{food.commonNames.join(', ')}</Text>
              </View>
            )}

            {/* Description */}
            {food.description ? (
              <Text style={modalStyles.description}>{food.description}</Text>
            ) : null}

            {/* Scientific Properties Card */}
            <View style={modalStyles.card}>
              <Text style={modalStyles.sectionTitle}>
                🔬 {t('properties', locale)}
              </Text>
              {food.properties && food.properties.length > 0 ? (
                <View style={modalStyles.propsGrid}>
                  {food.properties.map((p, idx) => (
                    <View key={p.id || idx} style={modalStyles.propItem}>
                      <Text style={modalStyles.propLabel}>{getPropertyTitle(p.propertyType)}</Text>
                      <Text style={modalStyles.propVal}>
                        {formatValue(p)} {p.unit ?? ''}
                      </Text>
                      {p.confidence && (
                        <View style={modalStyles.confidenceBadge}>
                          <Text style={modalStyles.confidenceText}>{p.confidence}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={modalStyles.emptyText}>Standard reference properties.</Text>
              )}
            </View>

            {/* Storage Conditions */}
            {food.storageConditions && food.storageConditions.length > 0 && (
              <View style={modalStyles.card}>
                <Text style={modalStyles.sectionTitle}>
                  🌡️ {t('storage_conditions', locale)}
                </Text>
                <View style={modalStyles.storageList}>
                  {food.storageConditions.map((s, idx) => (
                    <View key={s.id || idx} style={modalStyles.storageItem}>
                      <View style={modalStyles.storageTop}>
                        <Text style={modalStyles.storageType}>
                          {getStorageLabel(s.storageType, locale)}
                        </Text>
                        <Text style={modalStyles.storageMetrics}>
                          {s.minTempC != null ? `${s.minTempC}–${s.maxTempC}°C` : '—'}
                          {s.minRH != null ? ` · ${s.minRH}–${s.maxRH}% RH` : ''}
                        </Text>
                      </View>
                      {s.notes && <Text style={modalStyles.storageNotes}>{s.notes}</Text>}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Shelf-Life Reference */}
            {food.shelfLifeData && food.shelfLifeData.length > 0 && (
              <View style={modalStyles.card}>
                <Text style={modalStyles.sectionTitle}>
                  📅 {t('shelf_life_ref', locale)}
                </Text>
                <View style={modalStyles.storageList}>
                  {food.shelfLifeData.map((d, idx) => (
                    <View key={d.id || idx} style={modalStyles.storageItem}>
                      <View style={modalStyles.storageTop}>
                        <Text style={modalStyles.storageType}>
                          {getStorageLabel(d.storageType, locale)}
                        </Text>
                        <Text style={modalStyles.storageMetrics}>
                          {d.minDays ?? '—'}–{d.maxDays ?? '—'} days
                        </Text>
                      </View>
                      {d.packagingContext && (
                        <Text style={modalStyles.storageNotes}>Context: {d.packagingContext}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Scientific Sources */}
            {food.sources && food.sources.length > 0 && (
              <View style={modalStyles.card}>
                <Text style={modalStyles.sectionTitle}>
                  📚 {t('sources', locale)}
                </Text>
                <View style={modalStyles.sourcesList}>
                  {food.sources.map((src) => (
                    <View key={src.id} style={modalStyles.sourceRow}>
                      <Text style={modalStyles.sourceDocIcon}>📄</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={modalStyles.sourceCitation}>{src.citation}</Text>
                        <Text style={modalStyles.sourceMeta}>
                          {[src.publication, src.year].filter(Boolean).join(' · ') || 'Reference'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* Sticky Action Button */}
        {food && (
          <View style={modalStyles.footer}>
            <Pressable
              style={({ pressed }) => [
                modalStyles.analyzeBtn,
                pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
              ]}
              onPress={() => onStartAnalysis(food.slug)}
            >
              <Text style={modalStyles.analyzeBtnText}>
                {t('analyze_packaging_cta', locale)} ({getFoodName(food, locale)}) →
              </Text>
            </Pressable>
          </View>
        )}
        </View>
      </Animated.View>
    </View>
  );
}

export default function FoodsScreen() {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { openSidebar } = useSidebarStore();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedFoodSlug, setSelectedFoodSlug] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: foodsData, isLoading, refetch } = useQuery({
    queryKey: ['foods', selectedCategory, search],
    queryFn: () => foodsApi.list({ categorySlug: selectedCategory, search: search || undefined }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['food-categories'],
    queryFn: () => foodsApi.categories(),
  });

  const foods: FoodItem[] = foodsData?.data ?? [];
  const categories: FoodCategory[] = categoriesData?.data ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleFoodPress = (food: FoodItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFoodSlug(food.slug);
    setModalVisible(true);
  };

  const handleStartAnalysis = (slug: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setModalVisible(false);
    router.push(`/analysis/wizard/step-0-food?food=${slug}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
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
          <Text style={styles.headerTitle}>{t('food_database', locale)}</Text>
          <Text style={styles.headerSubtitle}>
            {t('foods_subtitle', locale)}
          </Text>
        </View>
        <Pressable
          style={styles.settingsBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/settings');
          }}
          hitSlop={12}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('search_food_input', locale)}
          placeholderTextColor={colors.content.muted}
          style={styles.searchInput}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsRow}
        style={styles.pillsScroll}
      >
        <Pressable
          onPress={() => setSelectedCategory(undefined)}
          hitSlop={6}
        >
          <View style={[styles.pill, !selectedCategory && styles.pillActive]}>
            <Text style={[styles.pillText, !selectedCategory && styles.pillTextActive]}>{t('all', locale)}</Text>
          </View>
        </Pressable>
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setSelectedCategory(cat.slug === selectedCategory ? undefined : cat.slug)}
            hitSlop={6}
          >
            <View style={[styles.pill, selectedCategory === cat.slug && styles.pillActive]}>
              <Text style={[styles.pillText, selectedCategory === cat.slug && styles.pillTextActive]}>
                {getCategoryName(cat, locale)}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Results count */}
      {!isLoading && (
        <View style={styles.resultsRow}>
          <Text style={styles.resultsCount}>{foods.length} {t('commodities_count', locale)}</Text>
        </View>
      )}

      {/* Food Grid */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary.DEFAULT} size="large" />
          <Text style={styles.loadingText}>{t('loading_foods', locale)}</Text>
        </View>
      ) : foods.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>{t('no_results_found', locale)}</Text>
          <Text style={styles.emptyDesc}>{t('try_different_search', locale)}</Text>
        </View>
      ) : (
        <FlatList
          data={foods}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary.DEFAULT}
            />
          }
          renderItem={({ item }) => (
            <FoodCard food={item} locale={locale} onPress={() => handleFoodPress(item)} styles={styles} />
          )}
        />
      )}

      {/* Food Detail Bottom Sheet Modal */}
      <FoodDetailModal
        slug={selectedFoodSlug}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onStartAnalysis={handleStartAnalysis}
        locale={locale}
      />
    </SafeAreaView>
  );
}

const createStyles = (C: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background.DEFAULT },

  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    gap: 12,
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: C.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.background.border,
  },
  menuIcon: {
    fontSize: 18,
    color: C.content.primary,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: C.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.background.border,
  },
  settingsIcon: {
    fontSize: 16,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: { fontSize: 20, fontFamily: 'Inter-Bold', color: C.content.primary },
  headerSubtitle: { fontSize: 12, color: C.content.muted, fontFamily: 'Inter-Regular', marginTop: 1 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.background.card,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.background.border,
    height: 44,
    gap: 8,
  },
  searchIcon: { fontSize: 15 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: C.content.primary,
    fontFamily: 'Inter-Regular',
    padding: 0,
  },
  clearBtn: { fontSize: 14, color: C.content.muted, paddingHorizontal: 4 },

  pillsScroll: { height: 44, flexGrow: 0, marginBottom: 8 },
  pillsRow: { paddingHorizontal: Spacing.md, gap: 8, flexDirection: 'row', alignItems: 'center' },
  pill: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.background.card,
    borderWidth: 1,
    borderColor: C.background.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: C.primary.DEFAULT, borderColor: C.primary.DEFAULT },
  pillText: { fontSize: 12, fontFamily: 'Inter-Medium', color: C.content.secondary },
  pillTextActive: { color: isDark ? '#ffffff' : C.primary.foreground },

  resultsRow: { paddingHorizontal: Spacing.md, marginBottom: 8 },
  resultsCount: { fontSize: 12, color: C.content.muted, fontFamily: 'Inter-Regular' },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: C.content.muted, fontFamily: 'Inter-Regular' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: C.content.primary },
  emptyDesc: { fontSize: 14, color: C.content.muted },

  grid: { paddingHorizontal: Spacing.md, paddingBottom: 24 },
  gridRow: { gap: 12, marginBottom: 12 },

  foodCard: {
    flex: 1,
    backgroundColor: C.background.card,
    borderRadius: BorderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: C.background.border,
    gap: 6,
  },
  foodEmojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primary.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  foodEmoji: { fontSize: 22 },
  foodName: { fontSize: 14, fontFamily: 'Inter-SemiBold', color: C.content.primary, lineHeight: 19 },
  foodCategory: { fontSize: 11, color: C.content.muted, fontFamily: 'Inter-Regular' },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  freshBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.primary.muted,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  freshBadgeText: { fontSize: 10, color: C.primary.DEFAULT, fontFamily: 'Inter-SemiBold' },
  viewDetailsText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: C.primary.DEFAULT,
  },
  pressed: { opacity: 0.7 },
});

const createModalStyles = (C: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  sheetWrap: {
    position: 'absolute',
    top: 28,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.background.DEFAULT,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 24,
  },
  safe: {
    flex: 1,
    backgroundColor: C.background.DEFAULT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderColor: C.background.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: C.content.secondary,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: C.content.primary,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: C.content.muted,
  },

  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: C.background.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: C.background.border,
  },
  heroIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.primary.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 32 },
  foodName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: C.content.primary,
  },
  scientificName: {
    fontSize: 12,
    fontStyle: 'italic',
    color: C.content.muted,
    marginTop: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  categoryBadge: {
    backgroundColor: C.background.elevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: C.content.secondary,
  },
  freshBadge: {
    backgroundColor: C.primary.muted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  freshBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: C.primary.DEFAULT,
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.background.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: C.background.border,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: C.content.muted,
  },
  infoVal: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: C.content.primary,
    flex: 1,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: C.content.secondary,
    lineHeight: 19,
  },

  card: {
    backgroundColor: C.background.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: C.background.border,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: C.content.primary,
    marginBottom: 4,
  },
  propsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  propItem: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: C.background.elevated,
    borderRadius: BorderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: C.background.border,
  },
  propLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: C.content.muted,
    textTransform: 'uppercase',
  },
  propVal: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: C.content.primary,
    marginTop: 2,
  },
  confidenceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.primary.muted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  confidenceText: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    color: C.primary.DEFAULT,
  },
  emptyText: {
    fontSize: 12,
    color: C.content.muted,
  },

  storageList: {
    gap: 8,
  },
  storageItem: {
    backgroundColor: C.background.elevated,
    borderRadius: BorderRadius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: C.background.border,
  },
  storageTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storageType: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: C.content.primary,
  },
  storageMetrics: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: C.primary.DEFAULT,
  },
  storageNotes: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: C.content.muted,
    marginTop: 4,
  },

  sourcesList: {
    gap: 8,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: C.background.elevated,
    borderRadius: BorderRadius.md,
    padding: 8,
  },
  sourceDocIcon: { fontSize: 13, marginTop: 1 },
  sourceCitation: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: C.content.primary,
  },
  sourceMeta: {
    fontSize: 9,
    fontFamily: 'Inter-Regular',
    color: C.content.muted,
    marginTop: 1,
  },

  footer: {
    backgroundColor: C.background.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: C.background.border,
  },
  analyzeBtn: {
    backgroundColor: C.primary.DEFAULT,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  analyzeBtnText: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: isDark ? '#051b11' : '#ffffff',
  },
});
