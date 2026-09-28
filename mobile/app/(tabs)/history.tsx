/**
 * History — Real list of past analyses from the API
 * Mirrors web analysis list page with COMPLETED/FAILED/PENDING status
 */
import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { analysisApi, type AnalysisResult } from '@/lib/api/analysis';
import { Typography, Spacing, BorderRadius } from '@/constants/colors';
import { useAppTheme, type ThemeColors } from '@/lib/theme/theme-store';
import { useSidebarStore } from '@/hooks/useSidebarStore';
import { useLanguageStore, getFoodName, getStatusLabel, getStorageLabel } from '@/lib/i18n/language-store';

function getStatusColor(status: string) {
  switch (status) {
    case 'COMPLETED': return '#22c55e';
    case 'FAILED': return '#ef4444';
    case 'PROCESSING': return '#f59e0b';
    default: return '#6b7280';
  }
}

function getObjectiveLabel(obj: string) {
  const map: Record<string, string> = {
    BALANCED: 'Balanced',
    MAX_SHELF_LIFE: 'Max Shelf Life',
    MIN_COST: 'Min Cost',
    SUSTAINABILITY: 'Sustainability',
  };
  return map[obj] ?? obj;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function HistoryScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { openSidebar } = useSidebarStore();
  const { locale } = useLanguageStore();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['analysis', 'all'],
    queryFn: () => analysisApi.list({ limit: 50 }),
  });

  const analyses: AnalysisResult[] = data?.data ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handlePress = (a: AnalysisResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (a.status === 'COMPLETED') {
      router.push(`/analysis/${a.id}/results`);
    }
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
          <Text style={styles.headerBarTitle}>Analysis History</Text>
          <Text style={styles.headerBarSub}>{analyses.length} past packaging evaluations</Text>
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

      {isLoading && !refreshing && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary.DEFAULT} size="large" />
        </View>
      )}

      {!isLoading && analyses.length === 0 && (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptyDesc}>
            Complete your first analysis to see it here
          </Text>
          <Pressable
            style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            onPress={() => router.push('/analysis/wizard/step-0-food')}
          >
            <View style={styles.startBtn}>
              <Text style={styles.startBtnText}>Start Analysis →</Text>
            </View>
          </Pressable>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.DEFAULT}
          />
        }
      >
        {analyses.map((a) => (
          <Pressable
            key={a.id}
            style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            onPress={() => handlePress(a)}
          >
            <View style={styles.card}>
              {/* Top row: food name + status */}
              <View style={styles.cardTop}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.foodName}>{getFoodName(a.food, locale) || 'Unknown food'}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(a.status)}18` }
                  ]}>
                    <Text style={[styles.statusText, { color: getStatusColor(a.status) }]}>
                      {getStatusLabel(a.status, locale)}
                    </Text>
                  </View>
                </View>

                {/* Module tag */}
                <View style={styles.modulePill}>
                  <Text style={styles.modulePillText}>
                    {a.food?.isFreshProduce ? '🌿 Fresh Produce' : '📦 Other Commodity'}
                  </Text>
                </View>
              </View>

              {/* Meta row */}
              <View style={styles.metaRow}>
                <Text style={styles.metaItem}>📍 {getStorageLabel(a.storageType, locale)}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaItem}>⏱ {a.targetShelfLifeDays} days</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaItem}>🎯 {getObjectiveLabel(a.objective)}</Text>
              </View>

              {/* Top recommendation if available */}
              {a.status === 'COMPLETED' && (a.recommendations?.[0]) && (
                <View style={styles.recRow}>
                  <Text style={styles.recLabel}>Top material: </Text>
                  <Text style={styles.recValue}>
                    {a.recommendations[0].material?.name ?? a.recommendations[0].structure?.name ?? '—'}
                  </Text>
                  {a.recommendations[0].estimatedShelfLifeMaxDays && (
                    <Text style={styles.recShelf}>
                      · {a.recommendations[0].estimatedShelfLifeMinDays}–{a.recommendations[0].estimatedShelfLifeMaxDays} days
                    </Text>
                  )}
                </View>
              )}

              {/* Footer: date + tap hint */}
              <View style={styles.cardFooter}>
                <Text style={styles.dateText}>{formatDate(a.createdAt)}</Text>
                {a.status === 'COMPLETED' && (
                  <Text style={styles.viewResults}>View results ›</Text>
                )}
              </View>
            </View>
          </Pressable>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background.DEFAULT },
    topHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.xs,
      paddingBottom: Spacing.xs,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.background.border,
      backgroundColor: colors.background.card,
    },
    menuBtn: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: colors.background.elevated,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.background.border,
    },
    menuIcon: {
      fontSize: 18,
      color: colors.content.primary,
    },
    headerBarTitle: {
      fontSize: 17,
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
    },
    headerBarSub: {
      fontSize: 11,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
    },
    settingsBtn: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: colors.background.elevated,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.background.border,
    },
    settingsIcon: {
      fontSize: 16,
    },

    loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: Spacing.lg,
    },
    emptyIcon: { fontSize: 52 },
    emptyTitle: { fontSize: 18, fontFamily: 'Inter-SemiBold', color: colors.content.primary },
    emptyDesc: { fontSize: 14, color: colors.content.muted, textAlign: 'center' },
    startBtn: {
      backgroundColor: colors.primary.DEFAULT,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: BorderRadius.lg,
      marginTop: 8,
    },
    startBtnText: { color: isDark ? '#0b1f13' : '#ffffff', fontFamily: 'Inter-SemiBold', fontSize: 14 },

    list: { padding: Spacing.md, gap: 12 },

    card: {
      backgroundColor: colors.background.card,
      borderRadius: BorderRadius.xl,
      padding: 16,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.background.border,
    },
    cardTop: { gap: 6 },
    cardTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    foodName: { fontSize: 15, fontFamily: 'Inter-SemiBold', color: colors.content.primary, flex: 1 },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      marginLeft: 8,
    },
    statusText: { fontSize: 10, fontFamily: 'Inter-SemiBold' },
    modulePill: {
      alignSelf: 'flex-start',
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    modulePillText: { fontSize: 11, color: colors.content.secondary, fontFamily: 'Inter-Medium' },

    metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
    metaItem: { fontSize: 11, color: colors.content.muted, fontFamily: 'Inter-Regular' },
    metaDot: { fontSize: 11, color: colors.content.muted },

    recRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    recLabel: { fontSize: 12, color: colors.content.muted, fontFamily: 'Inter-Regular' },
    recValue: { fontSize: 12, color: colors.content.primary, fontFamily: 'Inter-SemiBold' },
    recShelf: { fontSize: 12, color: colors.primary.DEFAULT, fontFamily: 'Inter-Regular' },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dateText: { fontSize: 11, color: colors.content.muted, fontFamily: 'Inter-Regular' },
    viewResults: { fontSize: 12, color: colors.primary.DEFAULT, fontFamily: 'Inter-Medium' },

    pressed: { opacity: 0.7 },
  });
}
