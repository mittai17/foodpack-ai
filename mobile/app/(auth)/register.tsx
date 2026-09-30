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

export default function RegisterScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { register, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.includes('@')) e.email = 'Enter a valid email address';
    if (password.length < 8) e.password = 'Password must be at least 8 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await register(email.trim().toLowerCase(), password, name.trim() || undefined);
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message ?? 'Registration failed';
      Alert.alert('Registration Failed', msg);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.kav} behavior={IS_IOS ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join NutriWrap and start analysing</Text>

          {[
            { label: 'Full name (optional)', value: name, set: setName, key: 'name', placeholder: 'Dr. Priya Sharma', type: 'default' as const },
            { label: 'Email address', value: email, set: setEmail, key: 'email', placeholder: 'you@example.com', type: 'email-address' as const },
          ].map(({ label, value, set, key, placeholder, type }) => (
            <View key={key} style={styles.fieldGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={[styles.input, errors[key] ? styles.inputError : null]}
                value={value}
                onChangeText={set}
                placeholder={placeholder}
                placeholderTextColor={colors.content.muted}
                keyboardType={type}
                autoCapitalize={key === 'name' ? 'words' : 'none'}
                autoCorrect={false}
              />
              {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
            </View>
          ))}

          {[
            { label: 'Password', value: password, set: setPassword, key: 'password' },
            { label: 'Confirm password', value: confirm, set: setConfirm, key: 'confirm' },
          ].map(({ label, value, set, key }) => (
            <View key={key} style={styles.fieldGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={[styles.input, errors[key] ? styles.inputError : null]}
                value={value}
                onChangeText={set}
                placeholder="••••••••"
                placeholderTextColor={colors.content.muted}
                secureTextEntry
              />
              {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
            </View>
          ))}

          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <LinearGradient colors={[colors.primary.DEFAULT, colors.primary.light]} style={styles.btnGradient}>
              <Text style={styles.btnText}>
                {isLoading ? 'Creating account…' : 'Create Account'}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.switchText}>
              Already have an account?{' '}
              <Text style={styles.switchLink}>Sign in</Text>
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
    errorText: { fontSize: Typography.size.xs, color: colors.danger.light, marginTop: Spacing.xs },
    btn: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: Spacing.lg, marginBottom: Spacing.md },
    btnGradient: { paddingVertical: 16, alignItems: 'center' },
    btnText: { fontSize: Typography.size.md, fontFamily: 'Inter-SemiBold', color: isDark ? '#0b1f13' : '#ffffff' },
    pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
    switchText: { fontSize: Typography.size.sm, color: colors.content.secondary, textAlign: 'center' },
    switchLink: { color: colors.primary.DEFAULT, fontFamily: 'Inter-Medium' },
  });
}
