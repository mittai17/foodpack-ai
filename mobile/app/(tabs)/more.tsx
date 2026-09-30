/**
 * More Screen — Platform Hub & Sidebar Launcher
 * Mirrors all web sidebar navigation items and provides direct access to platform settings.
 */
import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/hooks/useAuth';
import { useSidebarStore } from '@/hooks/useSidebarStore';
import { analysisApi } from '@/lib/api/analysis';
import { useAppTheme, type ThemeColors, Spacing, BorderRadius } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface NavItem {
  icon: string;
  label: string;
  subtitle?: string;
  route?: string;
  badge?: string;
  badgeColor?: string;
}

const TOOLS_NAV: NavItem[] = [
  { icon: '📁', label: 'My Projects', subtitle: 'Saved packaging batches and project workspaces', route: '/(tabs)/history' },
  { icon: '📦', label: 'Packaging Materials', subtitle: 'Multilayer barrier laminates & compostable bio-films', route: '/materials' },
  { icon: '📊', label: 'Compliance Reports', subtitle: 'Download PDF audit sheets and barrier certifications', route: '/(tabs)/history' },
  { icon: '🔖', label: 'Saved Analyses', subtitle: 'Bookmarked recommendations and shelf-life forecasts', route: '/(tabs)/history' },
  { icon: '⚗️', label: 'New Recommendation', subtitle: 'Launch multi-criteria packaging optimization wizard', route: '/analysis/wizard/step-0-food' },
];

const SETTINGS_NAV: NavItem[] = [
  { icon: '⚙️', label: 'Platform Settings', subtitle: 'Theme, account, default storage, and measurement units', route: '/(tabs)/settings' },
  { icon: '👤', label: 'Account Profile', subtitle: 'MoFPI researcher credentials and institution status', route: '/(tabs)/settings' },
  { icon: '📏', label: 'Units & Kinetics', subtitle: 'Metric/US barrier transmission and film thickness', route: '/(tabs)/settings' },
  { icon: '🔔', label: 'IoT Sensor Alerts', subtitle: 'Cold chain break, hypoxia, and condensation triggers', route: '/(tabs)/settings' },
  { icon: '🛡️', label: 'Security & Edge ML', subtitle: '2FA, active sessions, and local ONNX runtime', route: '/(tabs)/settings' },
];

function NavRow({
  item,
  onPress,
  isLast,
  styles,
  colors,
}: {
  item: NavItem;
  onPress?: () => void;
  isLast?: boolean;
  styles: any;
  colors: ThemeColors;
}) {
  return (
    <Pressable
      style={({ pressed }) => [pressed && { opacity: 0.75 }]}
      onPress={onPress}
    >
      <View style={[styles.navRow, isLast && { borderBottomWidth: 0 }]}>
        <View style={styles.navIconWrap}>
          <Text style={styles.navIcon}>{item.icon}</Text>
        </View>
        <View style={styles.navInfo}>
          <Text style={styles.navLabel}>{item.label}</Text>
          {item.subtitle && (
            <Text style={styles.navSubtitle} numberOfLines={1}>{item.subtitle}</Text>
          )}
        </View>
        {item.badge && (
          <View style={[styles.badge, { backgroundColor: item.badgeColor ?? colors.primary.muted }]}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        <Text style={styles.navChevron}>›</Text>
      </View>
    </Pressable>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { openSidebar } = useSidebarStore();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const { data: analysesData } = useQuery({
    queryKey: ['analysis', 'recent'],
    queryFn: () => analysisApi.list({ limit: 1 }),
  });
  const totalAnalyses = analysesData?.total ?? 0;

  const handleNav = (item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (item.route) {
      router.push(item.route as any);
      return;
    }
    Alert.alert(item.label, 'This feature is ready.');
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
          <Text style={styles.headerTitle}>Platform Hub</Text>
          <Text style={styles.headerSubtitle}>NutriWrap System Navigation</Text>
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Prominent Sidebar Launcher Banner */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            openSidebar();
          }}
          style={({ pressed }) => [pressed && { opacity: 0.85 }]}
        >
          <LinearGradient
            colors={isDark ? ['#1c3323', '#16281b'] : [colors.primary.muted, colors.background.card]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sidebarBanner}
          >
            <View style={styles.sidebarBannerLeft}>
              <View style={styles.sidebarBannerIconWrap}>
                <Text style={styles.sidebarBannerIcon}>☰</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.sidebarBadgeRow}>
                  <Text style={styles.sidebarBannerTitle}>Open Platform Sidebar</Text>
                  <View style={styles.webParityBadge}>
                    <Text style={styles.webParityText}>WEB PARITY</Text>
                  </View>
                </View>
                <Text style={styles.sidebarBannerSubtitle}>
                  Access full sidebar navigation drawer, user credentials, and direct links.
                </Text>
              </View>
            </View>
            <Text style={styles.sidebarChevron}>›</Text>
          </LinearGradient>
        </Pressable>

        {/* Profile Card */}
        <LinearGradient
          colors={isDark ? ['#1a2e1f', '#1c3323'] : [colors.primary.muted, colors.background.card]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.avatarWrap}>
            <LinearGradient
              colors={[colors.primary.DEFAULT, colors.primary.dark]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {(user.name ?? user.email ?? 'D').charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name ?? 'Demo Engineer'}</Text>
            <Text style={styles.profileEmail}>{user.email ?? 'engineer@foodpack.ai'}</Text>
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>✦ MoFPI LAB ACTIVE</Text>
            </View>
          </View>
          <Pressable
            style={styles.editBtn}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </Pressable>
        </LinearGradient>

        {/* Stats mini row */}
        <View style={styles.miniStats}>
          {[
            { label: 'Analyses Run', value: String(totalAnalyses) },
            { label: 'Saved Projects', value: '4' },
            { label: 'Compliance Reports', value: '2' },
          ].map((s) => (
            <View key={s.label} style={styles.miniStat}>
              <Text style={styles.miniStatValue}>{s.value}</Text>
              <Text style={styles.miniStatLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Section: Platform Tools */}
        <Text style={styles.sectionLabel}>PLATFORM TOOLS</Text>
        <View style={styles.navGroup}>
          {TOOLS_NAV.map((item, idx, arr) => (
            <NavRow
              key={item.label}
              item={item}
              isLast={idx === arr.length - 1}
              onPress={() => handleNav(item)}
              styles={styles}
              colors={colors}
            />
          ))}
        </View>

        {/* Section: Settings */}
        <Text style={styles.sectionLabel}>SETTINGS & PREFERENCES</Text>
        <View style={styles.navGroup}>
          {SETTINGS_NAV.map((item, idx, arr) => (
            <NavRow
              key={item.label}
              item={item}
              isLast={idx === arr.length - 1}
              onPress={() => handleNav(item)}
              styles={styles}
              colors={colors}
            />
          ))}
        </View>

        {/* App version footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>NutriWrap · Production Build v1.0.0</Text>
          <Text style={styles.footerText}>Built for SIH 2024 · Problem Statement 26236</Text>
          <Text style={styles.footerText}>Ministry of Food Processing Industries (MoFPI)</Text>
        </View>
      </ScrollView>
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
    paddingBottom: Spacing.sm,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.background.border,
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
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Inter-Bold',
    color: C.content.primary,
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: C.content.muted,
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

  content: { padding: Spacing.md, gap: 16, paddingBottom: 40 },

  sidebarBanner: {
    borderRadius: BorderRadius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(34,197,94,0.3)' : C.background.border,
    gap: 10,
  },
  sidebarBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sidebarBannerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primary.muted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.primary.subtleBorder,
  },
  sidebarBannerIcon: {
    fontSize: 18,
    color: C.primary.DEFAULT,
  },
  sidebarBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sidebarBannerTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: isDark ? C.primary.light : C.content.primary,
  },
  webParityBadge: {
    backgroundColor: C.primary.muted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  webParityText: {
    fontSize: 8,
    fontFamily: 'Inter-Bold',
    color: C.primary.DEFAULT,
    letterSpacing: 0.5,
  },
  sidebarBannerSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: C.content.secondary,
    lineHeight: 15,
    marginTop: 2,
  },
  sidebarChevron: {
    fontSize: 22,
    color: C.primary.DEFAULT,
    paddingRight: 4,
  },

  profileCard: {
    borderRadius: BorderRadius.xl,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(34,197,94,0.2)' : C.background.border,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  profileInfo: { flex: 1, gap: 2 },
  profileName: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: C.content.primary,
  },
  profileEmail: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: C.content.muted,
  },
  demoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.primary.muted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: 4,
  },
  demoBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    color: C.primary.DEFAULT,
    letterSpacing: 0.6,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: C.background.card,
    borderWidth: 1,
    borderColor: C.background.border,
  },
  editBtnText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: C.content.primary,
  },

  miniStats: {
    flexDirection: 'row',
    gap: 8,
  },
  miniStat: {
    flex: 1,
    backgroundColor: C.background.card,
    borderRadius: BorderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: C.background.border,
    alignItems: 'center',
    gap: 3,
  },
  miniStatValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: C.content.primary,
  },
  miniStatLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: C.content.muted,
    textAlign: 'center',
  },

  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: C.content.muted,
    letterSpacing: 0.8,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  navGroup: {
    backgroundColor: C.background.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: C.background.border,
    overflow: 'hidden',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.background.border,
  },
  navIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: { fontSize: 16 },
  navInfo: { flex: 1, gap: 2 },
  navLabel: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: C.content.primary,
  },
  navSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: C.content.muted,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: C.primary.DEFAULT,
  },
  navChevron: {
    fontSize: 18,
    color: C.content.muted,
  },

  footer: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: C.content.muted,
    textAlign: 'center',
  },
});
