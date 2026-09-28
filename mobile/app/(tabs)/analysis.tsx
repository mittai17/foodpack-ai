import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Typography, Spacing, BorderRadius, Shadow } from '@/constants/colors';
import { useAppTheme, type ThemeColors } from '@/lib/theme/theme-store';
import { useLanguageStore } from '@/lib/i18n/language-store';

const CATEGORY_CARDS = [
  {
    emoji: '🌿',
    titleKey: 'cat_fresh_produce_title' as const,
    subKey: 'cat_fresh_produce_sub' as const,
    gradient: ['#22c55e', '#16a34a'] as [string, string],
    tagKey: 'tag_map_ca' as const,
  },
  {
    emoji: '🌾',
    titleKey: 'cat_grains_pulses_title' as const,
    subKey: 'cat_grains_pulses_sub' as const,
    gradient: ['#f59e0b', '#d97706'] as [string, string],
    tagKey: 'tag_moisture_barrier' as const,
  },
  {
    emoji: '🧂',
    titleKey: 'cat_powders_spices_title' as const,
    subKey: 'cat_powders_spices_sub' as const,
    gradient: ['#ef4444', '#dc2626'] as [string, string],
    tagKey: 'tag_aroma_lock' as const,
  },
  {
    emoji: '🥛',
    titleKey: 'cat_liquids_dairy_title' as const,
    subKey: 'cat_liquids_dairy_sub' as const,
    gradient: ['#3b82f6', '#2563eb'] as [string, string],
    tagKey: 'tag_aseptic' as const,
  },
  {
    emoji: '🥜',
    titleKey: 'cat_nuts_snacks_title' as const,
    subKey: 'cat_nuts_snacks_sub' as const,
    gradient: ['#8b5cf6', '#7c3aed'] as [string, string],
    tagKey: 'tag_barrier_laminate' as const,
  },
  {
    emoji: '🍗',
    titleKey: 'cat_meat_seafood_title' as const,
    subKey: 'cat_meat_seafood_sub' as const,
    gradient: ['#ec4899', '#be185d'] as [string, string],
    tagKey: 'tag_high_barrier_map' as const,
  },
];

export default function AnalysisScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { locale, t } = useLanguageStore();

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/analysis/wizard/step-0-food');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('new_analysis', locale)}</Text>
          <Text style={styles.subtitle}>
            {t('start_analysis_desc', locale)}
          </Text>
        </View>

        {/* Module cards — matches web Fresh Produce + Other Commodities */}
        <View style={styles.moduleSection}>
          {/* Fresh Produce */}
          <Pressable
            style={({ pressed }) => [styles.primaryModule, pressed && styles.pressed]}
            onPress={handleStart}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryModuleGradient}
            >
              <View style={styles.primaryModuleRow}>
                <View style={styles.primaryModuleIconBg}>
                  <Text style={{ fontSize: 28 }}>🌿</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.primaryModuleTitle}>{t('fresh_fruits_veg', locale)}</Text>
                  <Text style={styles.primaryModuleDesc}>
                    {t('fresh_produce_desc', locale)}
                  </Text>
                </View>
                <Text style={styles.primaryModuleArrow}>›</Text>
              </View>
              <View style={styles.primaryModuleTags}>
                {['MAP', 'CA', 'High-barrier', 'Breathable'].map((tag) => (
                  <View key={tag} style={styles.primaryModuleTag}>
                    <Text style={styles.primaryModuleTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Pressable>

          {/* Other Commodities */}
          <Pressable
            style={({ pressed }) => [styles.secondaryModule, pressed && styles.pressed]}
            onPress={handleStart}
          >
            <View style={styles.secondaryModuleIconBg}>
              <Text style={{ fontSize: 28 }}>📦</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.secondaryModuleTitle}>{t('other_food_commodities', locale)}</Text>
              <Text style={styles.secondaryModuleDesc}>
                {t('other_food_desc', locale)}
              </Text>
            </View>
            <Text style={styles.secondaryModuleArrow}>›</Text>
          </Pressable>

          <Pressable onPress={handleStart}>
            <Text style={styles.notSureText}>
              {t('not_sure_guide', locale)}
            </Text>
          </Pressable>
        </View>

        {/* Quick category cards */}
        <Text style={styles.sectionTitle}>{t('quick_select', locale)}</Text>
        <View style={styles.grid}>
          {CATEGORY_CARDS.map((card) => (
            <Pressable
              key={card.titleKey}
              style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}
              onPress={handleStart}
            >
              <LinearGradient
                colors={card.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.categoryGradient}
              >
                <Text style={styles.categoryEmoji}>{card.emoji}</Text>
                <Text style={styles.categoryTitle}>{t(card.titleKey, locale)}</Text>
                <Text style={styles.categorySubtitle}>{t(card.subKey, locale)}</Text>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{t(card.tagKey, locale)}</Text>
                </View>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background.DEFAULT },
    content: { paddingHorizontal: Spacing.md, paddingBottom: Spacing['3xl'] },

    header: {
      paddingTop: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    title: {
      fontSize: Typography.size['2xl'],
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
    },
    subtitle: {
      fontSize: Typography.size.sm,
      fontFamily: 'Inter-Regular',
      color: colors.content.secondary,
      marginTop: 4,
      lineHeight: 20,
    },

    // Module cards
    moduleSection: {
      backgroundColor: colors.background.card,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.background.border,
      padding: Spacing.md,
      marginBottom: Spacing.xl,
      gap: Spacing.sm,
    },

    primaryModule: {
      borderRadius: BorderRadius.lg,
      overflow: 'hidden',
    },
    primaryModuleGradient: {
      padding: Spacing.md,
    },
    primaryModuleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    primaryModuleIconBg: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.md,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryModuleTitle: {
      fontSize: Typography.size.base,
      fontFamily: 'Inter-Bold',
      color: '#ffffff',
    },
    primaryModuleDesc: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-Regular',
      color: 'rgba(255,255,255,0.85)',
      marginTop: 2,
      lineHeight: 17,
    },
    primaryModuleArrow: {
      fontSize: Typography.size.xl,
      color: 'rgba(255,255,255,0.7)',
    },
    primaryModuleTags: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
    primaryModuleTag: {
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderRadius: BorderRadius.full,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    primaryModuleTagText: {
      fontSize: 10,
      fontFamily: 'Inter-Medium',
      color: 'rgba(255,255,255,0.95)',
    },

    secondaryModule: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.background.border,
      backgroundColor: isDark ? '#1a2433' : '#f0f4fb',
      padding: Spacing.md,
    },
    secondaryModuleIconBg: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.md,
      backgroundColor: isDark ? '#1e3a8a' : '#dbeafe',
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryModuleTitle: {
      fontSize: Typography.size.base,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.primary,
    },
    secondaryModuleDesc: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-Regular',
      color: colors.content.secondary,
      marginTop: 2,
      lineHeight: 17,
    },
    secondaryModuleArrow: {
      fontSize: Typography.size.xl,
      color: colors.content.muted,
    },

    notSureText: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-Regular',
      color: colors.content.secondary,
      textAlign: 'center',
      paddingTop: Spacing.xs,
    },

    sectionTitle: {
      fontSize: Typography.size.lg,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.primary,
      marginBottom: Spacing.md,
    },

    // Category cards grid
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    categoryCard: {
      width: '48%',
      borderRadius: BorderRadius.xl,
      overflow: 'hidden',
      ...Shadow.md,
    },
    categoryGradient: {
      padding: Spacing.md,
      minHeight: 130,
      justifyContent: 'flex-end',
    },
    categoryEmoji: { fontSize: 32, marginBottom: Spacing.sm },
    categoryTitle: {
      fontSize: Typography.size.base,
      fontFamily: 'Inter-Bold',
      color: '#ffffff',
    },
    categorySubtitle: {
      fontSize: 11,
      fontFamily: 'Inter-Regular',
      color: 'rgba(255,255,255,0.85)',
      marginTop: 2,
    },
    categoryTag: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: BorderRadius.full,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginTop: Spacing.sm,
    },
    categoryTagText: {
      fontSize: 10,
      fontFamily: 'Inter-Medium',
      color: 'rgba(255,255,255,0.95)',
    },

    pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  });
}
