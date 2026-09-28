import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useWizardStore } from '@/hooks/useWizardStore';
import { useLanguageStore } from '@/lib/i18n/language-store';
import { Typography, Spacing, BorderRadius } from '@/constants/colors';
import { useAppTheme, type ThemeColors } from '@/lib/theme/theme-store';

function WizardProgress({ step, colors }: { step: number; colors: ThemeColors }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4, marginBottom: Spacing.lg }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            backgroundColor: i <= step ? colors.primary.DEFAULT : colors.background.border,
          }}
        />
      ))}
    </View>
  );
}

const ADVANCED_FIELDS = [
  { key: 'moistureContentPercent', label: 'Moisture content', unit: '%', min: 0, max: 100 },
  { key: 'ph', label: 'pH', unit: '', min: 0, max: 14 },
  { key: 'fatContentPercent', label: 'Fat / oil content', unit: '%', min: 0, max: 100 },
  { key: 'respirationRateMlCo2PerKgPerHr', label: 'Respiration rate', unit: 'mL CO₂/kg/hr', min: 0, max: 1000 },
  { key: 'storageTemperatureC', label: 'Storage temperature', unit: '°C', min: -40, max: 60 },
  { key: 'relativeHumidityPercent', label: 'Relative humidity', unit: '%', min: 0, max: 100 },
  { key: 'measuredOtr', label: 'Measured OTR', unit: 'cc/m²/day', min: 0, max: 10000 },
  { key: 'measuredWvtr', label: 'Measured WVTR', unit: 'g/m²/day', min: 0, max: 10000 },
] as const;

export default function Step3AdvancedScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { locale, t } = useLanguageStore();
  const { advancedMode, setAdvancedMode, advancedInputs, setAdvancedInputs } = useWizardStore();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <WizardProgress step={3} colors={colors} />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('back_btn', locale)}</Text>
          </Pressable>
          <Text style={styles.stepLabel}>
            {locale === 'hi' ? 'चरण 4 / 5' : locale === 'ta' ? 'படி 4 / 5' : locale === 'te' ? 'దశ 4 / 5' : locale === 'kn' ? 'ಹಂತ 4 / 5' : locale === 'ml' ? 'ഘട്ടം 4 / 5' : 'Step 4 of 5'}
          </Text>
        </View>
        <Text style={styles.title}>{t('advanced_expert_title', locale)}</Text>
        <Text style={styles.subtitle}>
          {t('advanced_expert_sub', locale)}
        </Text>

        {/* Info callout */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {t('advanced_expert_tip', locale)}
          </Text>
        </View>

        {/* Toggle */}
        <Pressable
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setAdvancedMode(!advancedMode);
          }}
        >
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabel}>
              <Text style={styles.toggleTitle}>{t('enable_advanced_overrides', locale)}</Text>
              <Text style={styles.toggleSub}>{t('unlock_expert_inputs', locale)}</Text>
            </View>
            <Switch
              value={advancedMode}
              onValueChange={(v) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAdvancedMode(v);
              }}
              trackColor={{ false: colors.background.border, true: colors.primary.muted }}
              thumbColor={advancedMode ? colors.primary.DEFAULT : colors.content.muted}
            />
          </View>
        </Pressable>

        {/* Live IoT Sensor Sync */}
        {advancedMode && (
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setAdvancedInputs({
                storageTemperatureC: 4.1,
                relativeHumidityPercent: 89.2,
                respirationRateMlCo2PerKgPerHr: 28.5,
              });
            }}
          >
            <View style={styles.iotSyncBtn}>
              <Text style={styles.iotSyncIcon}>📡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.iotSyncTitle}>Auto-fill from Live IoT Sensor</Text>
                <Text style={styles.iotSyncSub}>ESP32-S3-LAB-01 · 4.1°C, 89.2% RH, 28.5 mL CO₂/kg·hr</Text>
              </View>
            </View>
          </Pressable>
        )}

        {/* Advanced fields */}
        {advancedMode && (
          <View style={styles.fieldsGrid}>
            {ADVANCED_FIELDS.map(({ key, label, unit }) => {
              const val = advancedInputs[key as keyof typeof advancedInputs];
              return (
                <View key={key} style={styles.fieldItem}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  <View style={styles.fieldInputRow}>
                    <TextInput
                      style={styles.fieldInput}
                      value={val !== undefined ? String(val) : ''}
                      onChangeText={(v) => {
                        if (v === '') {
                          const next = { ...advancedInputs };
                          delete next[key as keyof typeof next];
                          setAdvancedInputs(next as typeof advancedInputs);
                        } else {
                          const n = parseFloat(v);
                          if (!isNaN(n)) setAdvancedInputs({ [key]: n } as Partial<typeof advancedInputs>);
                        }
                      }}
                      placeholder="—"
                      placeholderTextColor={colors.content.muted}
                      keyboardType="decimal-pad"
                    />
                    {unit !== '' && <Text style={styles.fieldUnit}>{unit}</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Pressable
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/analysis/wizard/step-4-review');
          }}
        >
          <View style={styles.nextBtn}>
            <Text style={styles.nextBtnText}>{t('next_btn', locale)} →</Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background.DEFAULT },
    content: { paddingHorizontal: Spacing.md, paddingBottom: Spacing['2xl'] },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    backBtn: { minHeight: 44, justifyContent: 'center' },
    backText: { fontSize: Typography.size.base, fontFamily: 'Inter-Medium', color: colors.primary.DEFAULT },
    stepLabel: { fontSize: Typography.size.sm, fontFamily: 'Inter-Medium', color: colors.content.muted },
    title: { fontSize: Typography.size['2xl'], fontFamily: 'Inter-Bold', color: colors.content.primary, marginBottom: Spacing.xs },
    subtitle: { fontSize: Typography.size.sm, fontFamily: 'Inter-Regular', color: colors.content.secondary, marginBottom: Spacing.md, lineHeight: 20 },
    infoBox: {
      backgroundColor: colors.info.muted,
      borderWidth: 1,
      borderColor: colors.info.DEFAULT,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      marginBottom: Spacing.lg,
    },
    infoText: { fontSize: Typography.size.sm, fontFamily: 'Inter-Regular', color: colors.info.DEFAULT, lineHeight: 20 },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.background.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.background.border,
      marginBottom: Spacing.md,
      minHeight: 60,
    },
    toggleLabel: { flex: 1 },
    toggleTitle: { fontSize: Typography.size.base, fontFamily: 'Inter-SemiBold', color: colors.content.primary },
    toggleSub: { fontSize: Typography.size.xs, fontFamily: 'Inter-Regular', color: colors.content.secondary, marginTop: 2 },
    iotSyncBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      backgroundColor: colors.primary.muted,
      borderWidth: 1,
      borderColor: colors.primary.DEFAULT,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.lg,
    },
    iotSyncIcon: { fontSize: 24 },
    iotSyncTitle: { fontSize: Typography.size.sm, fontFamily: 'Inter-SemiBold', color: colors.primary.DEFAULT },
    iotSyncSub: { fontSize: 11, fontFamily: 'Inter-Regular', color: colors.content.muted, marginTop: 2 },
    fieldsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
    fieldItem: { width: '48%' },
    fieldLabel: { fontSize: Typography.size.xs, fontFamily: 'Inter-Medium', color: colors.content.secondary, marginBottom: 4 },
    fieldInputRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    fieldInput: {
      flex: 1,
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.background.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 10,
      fontSize: Typography.size.sm,
      fontFamily: 'Inter-Regular',
      color: colors.content.primary,
      minHeight: 44,
    },
    fieldUnit: { fontSize: 10, fontFamily: 'Inter-Regular', color: colors.content.muted, maxWidth: 60 },
    nextBtn: { backgroundColor: colors.primary.DEFAULT, borderRadius: BorderRadius.lg, paddingVertical: 16, alignItems: 'center' },
    nextBtnText: { fontSize: Typography.size.base, fontFamily: 'Inter-SemiBold', color: isDark ? '#0b1f13' : '#ffffff' },
  });
}
