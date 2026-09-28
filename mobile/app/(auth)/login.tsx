import { useState, useMemo } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/hooks/useAuth';
import { Typography, Spacing, BorderRadius } from '@/constants/colors';
import { useAppTheme, type ThemeColors } from '@/lib/theme/theme-store';
import { IS_IOS } from '@/constants/layout';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.includes('@')) e.email = 'Enter a valid email address';
    if (password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Login failed';
      Alert.alert('Sign In Failed', msg);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={IS_IOS ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your FoodPack AI account</Text>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.content.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.content.muted}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* CTA */}
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <LinearGradient colors={[colors.primary.DEFAULT, colors.primary.light]} style={styles.btnGradient}>
              <Text style={styles.btnText}>
                {isLoading ? 'Signing in…' : 'Sign In'}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.switchText}>
              Don't have an account?{' '}
              <Text style={styles.switchLink}>Create one</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background.DEFAULT },
    kav: { flex: 1 },
    scroll: { flexGrow: 1, paddingHorizontal: Spacing.md, paddingBottom: Spacing['2xl'] },
    backBtn: { marginTop: Spacing.md, marginBottom: Spacing.lg, alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
    backText: { fontSize: Typography.size.base, fontFamily: 'Inter-Medium', color: colors.primary.DEFAULT },
    title: { fontSize: Typography.size['2xl'], fontFamily: 'Inter-Bold', color: colors.content.primary, marginBottom: Spacing.xs },
    subtitle: { fontSize: Typography.size.base, fontFamily: 'Inter-Regular', color: colors.content.secondary, marginBottom: Spacing.xl },
    fieldGroup: { marginBottom: Spacing.md },
    label: { fontSize: Typography.size.sm, fontFamily: 'Inter-Medium', color: colors.content.secondary, marginBottom: Spacing.xs },
    input: {
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.background.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: 14,
      fontSize: Typography.size.base,
      fontFamily: 'Inter-Regular',
      color: colors.content.primary,
      minHeight: 50,
    },
    inputError: { borderColor: colors.danger.DEFAULT },
    errorText: { fontSize: Typography.size.xs, fontFamily: 'Inter-Regular', color: colors.danger.light, marginTop: Spacing.xs },
    btn: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: Spacing.lg, marginBottom: Spacing.md },
    btnGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: BorderRadius.lg },
    btnText: { fontSize: Typography.size.md, fontFamily: 'Inter-SemiBold', color: isDark ? '#0b1f13' : '#ffffff' },
    pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
    switchText: { fontSize: Typography.size.sm, fontFamily: 'Inter-Regular', color: colors.content.secondary, textAlign: 'center' },
    switchLink: { color: colors.primary.DEFAULT, fontFamily: 'Inter-Medium' },
  });
}
