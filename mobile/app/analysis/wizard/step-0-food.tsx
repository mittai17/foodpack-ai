import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, FlatList, Pressable, StyleSheet,
  Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { foodsApi, type FoodItem } from '@/lib/api/analysis';
import { useWizardStore } from '@/hooks/useWizardStore';
import { Typography, Spacing, BorderRadius } from '@/constants/colors';
import { useAppTheme, type ThemeColors } from '@/lib/theme/theme-store';
import { getFoodEmoji } from '@/lib/food-emoji';
import { useLanguageStore, getFoodName, getCategoryName, t } from '@/lib/i18n/language-store';

function WizardProgress({ step, colors }: { step: number; colors: ThemeColors }) {
  return (
    <View style={progressStyles.container}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[
            progressStyles.segment,
            { backgroundColor: i <= step ? colors.primary.DEFAULT : colors.background.border },
          ]}
        />
      ))}
    </View>
  );
}

const progressStyles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 4, marginBottom: Spacing.lg },
  segment: { flex: 1, height: 4, borderRadius: 2 },
});

export default function Step0FoodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const params = useLocalSearchParams<{ food?: string; foodSlug?: string }>();
  const initialFoodSlug = params.food || params.foodSlug;
  const { setFood, setUploadedImage } = useWizardStore();
  const { locale } = useLanguageStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'camera'>('search');

  const { data, isLoading } = useQuery({
    queryKey: ['foods', search],
    queryFn: () => foodsApi.list({ search: search || undefined }),
    staleTime: 1000 * 60 * 10,
  });

  const foods = data?.data ?? [];

  useEffect(() => {
    if (initialFoodSlug && foods.length > 0 && !selected) {
      const matched = foods.find(
        (f) => f.slug === initialFoodSlug || f.id === initialFoodSlug,
      );
      if (matched) {
        setSelected(matched);
        setFood(matched);
      }
    }
  }, [initialFoodSlug, foods, selected, setFood]);

  const handlePickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setUploadedImage(result.assets[0].uri);
    }
  };

  const handleCameraCapture = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setUploadedImage(result.assets[0].uri);
    }
  };

  const handleSelect = (food: FoodItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(food);
    setFood(food);
  };

  const handleNext = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/analysis/wizard/step-1-details');
  };

  const renderFood = useCallback(({ item }: { item: FoodItem }) => (
    <Pressable
      style={({ pressed }) => [
        styles.foodItem,
        selected?.id === item.id && styles.foodItemSelected,
        pressed && { opacity: 0.8 },
      ]}
      onPress={() => handleSelect(item)}
    >
      <View style={styles.foodItemRow}>
        <View style={styles.foodEmoji}>
          <Text style={styles.foodEmojiText}>
            {getFoodEmoji(item.slug, item.category?.slug)}
          </Text>
        </View>
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{getFoodName(item, locale)}</Text>
          <Text style={styles.foodCategory}>{getCategoryName(item.category, locale)}</Text>
        </View>
        {selected?.id === item.id && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </View>
    </Pressable>
  ), [selected, locale, styles]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Progress */}
        <WizardProgress step={0} colors={colors} />

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
          <Text style={styles.step}>
            {locale === 'hi' ? 'चरण 1 / 5' : locale === 'ta' ? 'படி 1 / 5' : locale === 'te' ? 'దశ 1 / 5' : locale === 'kn' ? 'ಹಂತ 1 / 5' : locale === 'ml' ? 'ഘട്ടം 1 / 5' : 'Step 1 of 5'}
          </Text>
        </View>
        <Text style={styles.title}>{t('select_food_header', locale)}</Text>
        <Text style={styles.subtitle}>{t('select_food_header_desc', locale)}</Text>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['search', 'camera'] as const).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'search' ? `🔍 ${t('search_btn', locale)}` : `📷 ${t('camera_btn', locale)}`}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'search' ? (
          <>
            {/* Search */}
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder={t('search_foods_placeholder', locale)}
              placeholderTextColor={colors.content.muted}
              returnKeyType="search"
            />

            {/* Food List */}
            {isLoading ? (
              <ActivityIndicator color={colors.primary.DEFAULT} style={{ marginTop: Spacing.xl }} />
            ) : (
              <FlatList
                data={foods}
                keyExtractor={(item) => item.id}
                renderItem={renderFood}
                ItemSeparatorComponent={() => <View style={{ height: Spacing.xs }} />}
                style={styles.list}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </>
        ) : (
          <View style={styles.imageSection}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>No image selected</Text>
              </View>
            )}
            <View style={styles.imageButtons}>
              <Pressable
                style={({ pressed }) => [styles.imageBtn, pressed && { opacity: 0.8 }]}
                onPress={handleCameraCapture}
              >
                <Text style={styles.imageBtnText}>📷 Take Photo</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.imageBtn, pressed && { opacity: 0.8 }]}
                onPress={handlePickImage}
              >
                <Text style={styles.imageBtnText}>🖼 From Gallery</Text>
              </Pressable>
            </View>
            {imageUri && (
              <Text style={styles.imageHint}>
                Photo uploaded. Now select the food from the list above or type to search.
              </Text>
            )}
          </View>
        )}

        {/* Footer CTA */}
        <View style={[styles.footer, { paddingBottom: Math.max(Spacing.md, insets.bottom + 12) }]}>
          <Pressable
            onPress={handleNext}
            disabled={!selected}
            style={({ pressed }) => [{ opacity: pressed && selected ? 0.85 : 1 }]}
          >
            <View style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}>
              <Text style={[styles.nextBtnText, !selected && { color: colors.content.muted }]}>
                {selected
                  ? locale === 'en'
                    ? `${t('continue_with_food', locale)} ${getFoodName(selected, locale)} →`
                    : `${getFoodName(selected, locale)} ${t('continue_with_food', locale)} →`
                  : t('select_food_to_continue', locale)}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background.DEFAULT },
    container: { flex: 1, paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    closeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    closeBtnText: { fontSize: Typography.size.lg, color: colors.content.secondary },
    step: { fontSize: Typography.size.sm, fontFamily: 'Inter-Medium', color: colors.content.muted },
    title: { fontSize: Typography.size['2xl'], fontFamily: 'Inter-Bold', color: colors.content.primary, marginBottom: Spacing.xs },
    subtitle: { fontSize: Typography.size.sm, fontFamily: 'Inter-Regular', color: colors.content.secondary, marginBottom: Spacing.md },
    tabRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
    tab: {
      flex: 1,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.background.border,
      alignItems: 'center',
      minHeight: 44,
      justifyContent: 'center',
    },
    tabActive: { backgroundColor: colors.primary.muted, borderColor: colors.primary.DEFAULT },
    tabText: { fontSize: Typography.size.sm, fontFamily: 'Inter-Medium', color: colors.content.secondary },
    tabTextActive: { color: colors.primary.DEFAULT },
    searchInput: {
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.background.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: 12,
      fontSize: Typography.size.base,
      fontFamily: 'Inter-Regular',
      color: colors.content.primary,
      marginBottom: Spacing.sm,
      minHeight: 48,
    },
    list: { flex: 1, flexGrow: 1, flexShrink: 1 },
    foodItem: {
      backgroundColor: colors.background.card,
      borderRadius: BorderRadius.md,
      padding: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.background.border,
      minHeight: 60,
      justifyContent: 'center',
    },
    foodItemRow: { flexDirection: 'row', alignItems: 'center', width: '100%', gap: Spacing.sm },
    foodItemSelected: { borderColor: colors.primary.DEFAULT, backgroundColor: colors.primary.muted },
    foodEmoji: {
      width: 44,
      height: 44,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.background.elevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    foodEmojiText: { fontSize: 22 },
    foodInfo: { flex: 1 },
    foodName: { fontSize: Typography.size.base, fontFamily: 'Inter-SemiBold', color: colors.content.primary },
    foodCategory: { fontSize: Typography.size.xs, fontFamily: 'Inter-Regular', color: colors.content.secondary, marginTop: 2 },
    checkmark: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary.DEFAULT, alignItems: 'center', justifyContent: 'center' },
    checkmarkText: { fontSize: Typography.size.sm, color: isDark ? '#0b1f13' : '#ffffff', fontFamily: 'Inter-Bold' },
    imageSection: { flex: 1, gap: Spacing.md },
    imagePlaceholder: {
      flex: 1,
      backgroundColor: colors.background.card,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background.border,
      borderStyle: 'dashed',
    },
    imagePlaceholderText: { fontSize: Typography.size.base, fontFamily: 'Inter-Regular', color: colors.content.muted },
    previewImage: { flex: 1, borderRadius: BorderRadius.xl, backgroundColor: colors.background.card },
    imageButtons: { flexDirection: 'row', gap: Spacing.sm },
    imageBtn: {
      flex: 1,
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.background.border,
      borderRadius: BorderRadius.md,
      paddingVertical: 14,
      alignItems: 'center',
      minHeight: 48,
    },
    imageBtnText: { fontSize: Typography.size.sm, fontFamily: 'Inter-Medium', color: colors.content.primary },
    imageHint: { fontSize: Typography.size.xs, fontFamily: 'Inter-Regular', color: colors.content.secondary, textAlign: 'center' },
    footer: { backgroundColor: colors.background.DEFAULT, paddingTop: Spacing.sm },
    nextBtn: {
      backgroundColor: colors.primary.DEFAULT,
      borderRadius: BorderRadius.lg,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
    },
    nextBtnDisabled: { backgroundColor: colors.background.border },
    nextBtnText: {
      fontSize: Typography.size.base,
      fontFamily: 'Inter-SemiBold',
      color: isDark ? '#0b1f13' : '#ffffff',
    },
  });
}
