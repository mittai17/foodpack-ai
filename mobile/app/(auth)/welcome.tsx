import { useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/hooks/useAuth';
import { Typography, Spacing, BorderRadius } from '@/constants/colors';
import { useAppTheme, type ThemeColors } from '@/lib/theme/theme-store';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { loadProfile, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadProfile().then(() => {
      if (isAuthenticated) router.replace('/(tabs)');
    });
  }, [loadProfile, isAuthenticated, router]);

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/login');
  };

  const handleRegister = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/register');
  };

  return (
    <View style={styles.container}>
      {/* Warm background gradient */}
      <LinearGradient
        colors={isDark ? ['#17150f', '#1a1f14', '#17150f'] : ['#f7f3ea', '#ede6d8', '#f7f3ea']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle ambient glow */}
      <View style={styles.glowCircle} />

      <SafeAreaView style={styles.safe}>
        {/* Hero section */}
        <View style={styles.heroSection}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[colors.primary.DEFAULT, colors.primary.light]}
              style={styles.logoBg}
            >
              <Text style={styles.logoEmoji}>🌿</Text>
            </LinearGradient>
            {/* Subtle glow ring */}
            <View style={styles.logoGlow} />
          </View>

          <Text style={styles.appName}>FoodPack AI</Text>
          <Text style={styles.tagline}>
            Science-backed packaging recommendations{'\n'}for every food commodity
          </Text>

          {/* Feature pills */}
          <View style={styles.pills}>
            {[
              { label: '✦ AI-Powered', color: colors.primary.muted },
              { label: '🔬 Science-Backed', color: isDark ? '#1e3323' : '#dcfce7' },
              { label: '⚡ Deterministic', color: isDark ? '#1c2b3a' : '#dbeafe' },
            ].map((pill) => (
              <View key={pill.label} style={[styles.pill, { backgroundColor: pill.color }]}>
                <Text style={styles.pillText}>{pill.label}</Text>
              </View>
            ))}
          </View>

          {/* Stats strip */}
          <View style={styles.statsStrip}>
            {[
              { value: '50+', label: 'Food Categories' },
              { value: '200+', label: 'Materials' },
              { value: '6', label: 'Languages' },
            ].map((s, i) => (
              <View key={s.label} style={[styles.statItem, i < 2 && styles.statDivider]}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {/* Get Started */}
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={handleRegister}
          >
            <LinearGradient
              colors={[colors.primary.DEFAULT, colors.primary.light]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtnGradient}
            >
              <Text style={styles.primaryBtnText}>Get Started</Text>
              <Text style={styles.primaryBtnArrow}>→</Text>
            </LinearGradient>
          </Pressable>

          {/* Sign In */}
          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
            onPress={handleLogin}
          >
            <Text style={styles.secondaryBtnText}>Sign In</Text>
          </Pressable>

          {/* Guest explore */}
          <Pressable
            style={({ pressed }) => [styles.guestBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.guestBtnText}>Explore Dashboard →</Text>
          </Pressable>

          <Text style={styles.legal}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.DEFAULT },
    safe: { flex: 1, paddingHorizontal: Spacing.md },
    glowCircle: {
      position: 'absolute',
      top: -60,
      alignSelf: 'center',
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor: colors.primary.DEFAULT + '18',
    },

    heroSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: Spacing['2xl'],
    },

    logoContainer: {
      marginBottom: Spacing.lg,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoBg: {
      width: 96,
      height: 96,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoGlow: {
      position: 'absolute',
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary.DEFAULT + '22',
    },
    logoEmoji: { fontSize: 48 },

    appName: {
      fontSize: Typography.size['3xl'],
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
      marginBottom: Spacing.sm,
      letterSpacing: -0.5,
    },
    tagline: {
      fontSize: Typography.size.base,
      fontFamily: 'Inter-Regular',
      color: colors.content.secondary,
      textAlign: 'center',
      lineHeight: 22,
      maxWidth: 290,
      marginBottom: Spacing.lg,
    },

    pills: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.xl, flexWrap: 'wrap', justifyContent: 'center' },
    pill: {
      borderRadius: BorderRadius.full,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: colors.background.border,
    },
    pillText: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-Medium',
      color: colors.primary.light,
    },

    statsStrip: {
      flexDirection: 'row',
      backgroundColor: colors.background.card,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.background.border,
      overflow: 'hidden',
      width: '100%',
    },
    statItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
    statDivider: { borderRightWidth: 1, borderRightColor: colors.background.border },
    statValue: { fontSize: Typography.size.xl, fontFamily: 'Inter-Bold', color: colors.primary.DEFAULT },
    statLabel: { fontSize: 10, fontFamily: 'Inter-Regular', color: colors.content.secondary, marginTop: 2 },

    actions: {
      paddingBottom: Spacing.lg,
      gap: Spacing.sm,
    },

    primaryBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
    primaryBtnGradient: {
      paddingVertical: 16,
      alignItems: 'center',
      borderRadius: BorderRadius.lg,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Spacing.sm,
    },
    primaryBtnText: {
      fontSize: Typography.size.md,
      fontFamily: 'Inter-SemiBold',
      color: isDark ? '#0b1f13' : '#ffffff',
    },
    primaryBtnArrow: {
      fontSize: Typography.size.md,
      color: isDark ? '#0b1f13' : '#ffffff',
    },

    secondaryBtn: {
      paddingVertical: 16,
      alignItems: 'center',
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.background.border,
      backgroundColor: colors.background.card,
    },
    secondaryBtnText: {
      fontSize: Typography.size.md,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.primary,
    },

    pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },

    guestBtn: {
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    guestBtnText: {
      fontSize: Typography.size.sm,
      fontFamily: 'Inter-Medium',
      color: colors.primary.DEFAULT,
    },

    legal: {
      fontSize: Typography.size.xs,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
      textAlign: 'center',
      lineHeight: 18,
      marginTop: Spacing.xs,
    },
  });
}
