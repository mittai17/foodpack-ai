import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  BackHandler,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSidebarStore } from '@/hooks/useSidebarStore';
import { useAuthStore } from '@/hooks/useAuth';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  useAppTheme,
  type ThemeColors,
} from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 340);

interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: string;
  highlight?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞', route: '/(tabs)' },
  { id: 'newAnalysis', label: 'New Analysis', icon: '➕', route: '/analysis/wizard/step-0-food' },
  { id: 'iotSensors', label: 'IoT Sensors', icon: '⌁', route: '/(tabs)/iot', badge: 'LIVE' },
  { id: 'myProjects', label: 'My Projects', icon: '📁', route: '/(tabs)/history' },
  { id: 'foodDatabase', label: 'Food Database', icon: '🌿', route: '/(tabs)/foods' },
  { id: 'materials', label: 'Packaging Materials', icon: '📦', route: '/(tabs)/foods' },
  { id: 'reports', label: 'Reports', icon: '📊', route: '/(tabs)/history' },
  { id: 'saved', label: 'Saved', icon: '🔖', route: '/(tabs)/history' },
  { id: 'learn', label: 'Learn & Science', icon: '📖', route: '/analysis/wizard/step-0-food' },
  { id: 'settings', label: 'Settings', icon: '⚙️', route: '/(tabs)/settings', highlight: true },
];

export function SidebarDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useSidebarStore();
  const { user } = useAuthStore();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [mounted, setMounted] = useState(false);

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMounted(false);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const backAction = () => {
      handleClose();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isOpen]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      closeSidebar();
      setMounted(false);
    });
  };

  const handleNavigate = (item: NavItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleClose();
    setTimeout(() => {
      router.push(item.route as any);
    }, 180);
  };

  if (!mounted && !isOpen) return null;

  return (
    <View style={styles.overlay} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* Animated semi-transparent backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Animated Sliding Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left']}>
            {/* Header: Brand & Close */}
            <View style={styles.header}>
              <View style={styles.brandRow}>
                <Image 
                  source={require('@/assets/images/nutriwrap-logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Pressable
                  style={styles.closeBtn}
                  onPress={handleClose}
                  hitSlop={12}
                >
                  <Text style={styles.closeText}>✕</Text>
                </Pressable>
              </View>

              {/* User profile card */}
              <Pressable
                style={styles.userCard}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleNavigate({ id: 'settings', label: 'Settings', icon: '⚙️', route: '/(tabs)/settings' });
                }}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(user?.name?.[0] ?? user?.email?.[0] ?? 'D').toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user?.name ?? 'Demo Engineer'}
                  </Text>
                  <Text style={styles.userRole} numberOfLines={1}>
                    MoFPI Innovation Lab · Active
                  </Text>
                </View>
                <View style={styles.onlineDot} />
              </Pressable>
            </View>

            {/* Navigation Items List */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.navList}
            >
              <Text style={styles.sectionLabel}>PLATFORM NAVIGATION</Text>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  (item.route === '/(tabs)' && pathname === '/') ||
                  (item.route !== '/(tabs)' && pathname.includes(item.id));
                return (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [pressed && { opacity: 0.75 }]}
                    onPress={() => handleNavigate(item)}
                  >
                    <View
                      style={[
                        styles.navItem,
                        isActive && styles.navItemActive,
                        item.highlight && styles.navItemHighlight,
                      ]}
                    >
                      <Text style={styles.navIcon}>{item.icon}</Text>
                      <Text
                        style={[
                          styles.navLabel,
                          isActive && styles.navLabelActive,
                          item.highlight && styles.navLabelHighlight,
                        ]}
                        numberOfLines={1}
                      >
                        {item.label}
                      </Text>
                      {item.badge ? (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Bottom Sustainability Banner */}
            <View style={styles.footer}>
              <LinearGradient
                colors={isDark ? ['#1c3323', '#16281b'] : [colors.primary.muted, colors.background.elevated]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.footerBanner}
              >
                <View style={styles.footerTopRow}>
                  <Text style={styles.footerIcon}>🌿</Text>
                  <Text style={styles.footerTitle}>Sustainable Packaging</Text>
                </View>
                <Text style={styles.footerSubtitle}>
                  Ministry of Food Processing Industries (MoFPI) · SIH 26236
                </Text>
              </LinearGradient>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFill,
      zIndex: 99999,
      elevation: 99999,
      flexDirection: 'row',
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    drawer: {
      width: DRAWER_WIDTH,
      height: '100%',
      backgroundColor: colors.background.sidebar || colors.background.DEFAULT,
      borderRightWidth: 1,
      borderRightColor: colors.background.border,
      shadowColor: '#000',
      shadowOffset: { width: 6, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 25,
      zIndex: 100000,
    },
    safeArea: {
      flex: 1,
      justifyContent: 'space-between',
    },
    header: {
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.background.border,
      gap: Spacing.sm,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    logoImage: {
      width: 160,
      height: 45,
    },
    closeBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.background.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeText: {
      fontSize: 13,
      color: colors.content.muted,
      fontFamily: 'Inter-Bold',
    },

    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.background.card,
      borderRadius: BorderRadius.lg,
      padding: 8,
      borderWidth: 1,
      borderColor: colors.background.border,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary.DEFAULT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 12,
      fontFamily: 'Inter-Bold',
      color: colors.primary.foreground,
    },
    userName: {
      fontSize: 12,
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
    },
    userRole: {
      fontSize: 10,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
    },
    onlineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary.DEFAULT,
      marginRight: 4,
    },

    navList: {
      paddingHorizontal: 10,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.md,
      gap: 3,
    },
    sectionLabel: {
      fontSize: 10,
      fontFamily: 'Inter-Bold',
      color: colors.content.muted,
      letterSpacing: 0.8,
      paddingHorizontal: 8,
      marginBottom: 4,
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: BorderRadius.md,
    },
    navItemActive: {
      backgroundColor: colors.primary.muted,
    },
    navItemHighlight: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    },
    navIcon: {
      fontSize: 16,
      width: 22,
      textAlign: 'center',
    },
    navLabel: {
      flex: 1,
      fontSize: 13,
      fontFamily: 'Inter-Medium',
      color: colors.content.secondary,
    },
    navLabelActive: {
      color: colors.primary.DEFAULT,
      fontFamily: 'Inter-Bold',
    },
    navLabelHighlight: {
      color: colors.content.primary,
    },
    badge: {
      backgroundColor: colors.primary.muted,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: BorderRadius.full,
    },
    badgeText: {
      fontSize: 9,
      fontFamily: 'Inter-Bold',
      color: colors.primary.DEFAULT,
    },

    footer: {
      padding: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.background.border,
    },
    footerBanner: {
      borderRadius: BorderRadius.lg,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.primary.subtleBorder,
      gap: 4,
    },
    footerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    footerIcon: { fontSize: 13 },
    footerTitle: {
      fontSize: 12,
      fontFamily: 'Inter-Bold',
      color: colors.primary.DEFAULT,
    },
    footerSubtitle: {
      fontSize: 10,
      fontFamily: 'Inter-Regular',
      color: colors.content.secondary,
      lineHeight: 14,
    },
  });
