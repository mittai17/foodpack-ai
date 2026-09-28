import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  OBJECTIVES, type ObjectiveType,
} from '@foodpack/shared';
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

const OBJECTIVE_ICONS: Record<ObjectiveType, string> = {
  BALANCED: '⚖️',
  MAX_SHELF_LIFE: '⏱️',
  MIN_COST: '💰',
  SUSTAINABILITY: '🌿',
};

const OBJECTIVE_DESCRIPTIONS: Record<ObjectiveType, string> = {
  BALANCED: 'Best overall trade-off',
  MAX_SHELF_LIFE: 'Maximise storage duration',
  MIN_COST: 'Minimise packaging cost',
  SUSTAINABILITY: 'Eco-friendly materials',
};

export default function Step2ParametersScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { locale, t } = useLanguageStore();
  const {
    targetShelfLifeDays, setTargetShelfLifeDays,
    packageWeightKg, setPackageWeightKg,
    objective, setObjective,
  } = useWizardStore();

  const objectiveLabels: Record<ObjectiveType, string> = {
    BALANCED: t('goal_balanced', locale),
    MAX_SHELF_LIFE: t('goal_shelf_life', locale),
    MIN_COST: t('goal_cost', locale),
    SUSTAINABILITY: t('goal_sustainability', locale),
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <WizardProgress step={2} colors={colors} />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('back_btn', locale)}</Text>
          </Pressable>
          <Text style={styles.stepLabel}>
            {locale === 'hi' ? 'चरण 3 / 5' : locale === 'ta' ? 'படி 3 / 5' : locale === 'te' ? 'దశ 3 / 5' : locale === 'kn' ? 'ಹಂತ 3 / 5' : locale === 'ml' ? 'ഘട്ടം 3 / 5' : 'Step 3 of 5'}
          </Text>
        </View>
        <Text style={styles.title}>{t('parameters_title', locale)}</Text>
        <Text style={styles.subtitle}>{t('parameters_subtitle', locale)}</Text>

        {/* Target shelf life */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldTitle}>{t('target_shelf_life_label', locale)}</Text>
          <Text style={styles.fieldHint}>How many days do you need the product to last?</Text>
          <View style={styles.numericRow}>
            <Pressable
              style={styles.stepper}
              onPress={() => setTargetShelfLifeDays(Math.max(1, targetShelfLifeDays - 1))}
            >
              <Text style={styles.stepperText}>−</Text>
            </Pressable>
            <TextInput
              style={styles.numericInput}
              value={String(targetShelfLifeDays)}
              onChangeText={(v) => {
                const n = parseInt(v, 10);
                if (!isNaN(n) && n >= 1 && n <= 730) setTargetShelfLifeDays(n);
              }}
              keyboardType="number-pad"
              selectTextOnFocus
            />
            <Text style={styles.numericUnit}>days</Text>
            <Pressable
              style={styles.stepper}
              onPress={() => setTargetShelfLifeDays(Math.min(730, targetShelfLifeDays + 1))}
            >
              <Text style={styles.stepperText}>+</Text>
            </Pressable>
          </View>
        </View>

        {/* Pack weight */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldTitle}>{t('pack_weight_label', locale)}</Text>
          <View style={styles.numericRow}>
            <TextInput
              style={[styles.numericInput, { flex: 1 }]}
              value={String(packageWeightKg)}
              onChangeText={(v) => {
                const n = parseFloat(v);
                if (!isNaN(n) && n > 0) setPackageWeightKg(n);
              }}
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
            <Text style={styles.numericUnit}>kg</Text>
          </View>
        </View>

        {/* Objective */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldTitle}>{t('optimization_goal_label', locale)}</Text>
          <View style={styles.objectiveGrid}>
            {OBJECTIVES.map((obj) => (
              <Pressable
                key={obj}
                style={({ pressed }) => [{ width: '48%', opacity: pressed ? 0.85 : 1 }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setObjective(obj);
                }}
              >
                <View style={[styles.objectiveCard, objective === obj && styles.objectiveCardSelected]}>
                  <Text style={styles.objectiveIcon}>{OBJECTIVE_ICONS[obj]}</Text>
                  <Text style={[styles.objectiveLabel, objective === obj && styles.objectiveLabelSelected]}>
                    {objectiveLabels[obj]}
                  </Text>
                  <Text style={styles.objectiveDesc}>{OBJECTIVE_DESCRIPTIONS[obj]}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/analysis/wizard/step-3-advanced');
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
    subtitle: { fontSize: Typography.size.sm, fontFamily: 'Inter-Regular', color: colors.content.secondary, marginBottom: Spacing.xl },
    fieldGroup: { marginBottom: Spacing.xl },
    fieldTitle: { fontSize: Typography.size.base, fontFamily: 'Inter-SemiBold', color: colors.content.primary, marginBottom: 4 },
    fieldHint: { fontSize: Typography.size.xs, fontFamily: 'Inter-Regular', color: colors.content.secondary, marginBottom: Spacing.md },
    numericRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    stepper: {
      width: 44,
      height: 44,
      backgroundColor: colors.background.card,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.background.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperText: { fontSize: Typography.size.xl, fontFamily: 'Inter-Bold', color: colors.content.primary },
    numericInput: {
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.background.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: 10,
      fontSize: Typography.size.xl,
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
      minWidth: 80,
      textAlign: 'center',
      minHeight: 48,
    },
    numericUnit: { fontSize: Typography.size.base, fontFamily: 'Inter-Regular', color: colors.content.secondary },
    objectiveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    objectiveCard: {
      width: '100%',
      backgroundColor: colors.background.card,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.background.border,
      minHeight: 100,
    },
    objectiveCardSelected: { borderColor: colors.primary.DEFAULT, backgroundColor: colors.primary.muted },
    objectiveIcon: { fontSize: 28, marginBottom: Spacing.xs },
    objectiveLabel: { fontSize: Typography.size.sm, fontFamily: 'Inter-SemiBold', color: colors.content.secondary, marginBottom: 2 },
    objectiveLabelSelected: { color: colors.primary.DEFAULT },
    objectiveDesc: { fontSize: Typography.size.xs, fontFamily: 'Inter-Regular', color: colors.content.muted },
    nextBtn: { backgroundColor: colors.primary.DEFAULT, borderRadius: BorderRadius.lg, paddingVertical: 16, alignItems: 'center' },
    nextBtnText: { fontSize: Typography.size.base, fontFamily: 'Inter-SemiBold', color: isDark ? '#0b1f13' : '#ffffff' },
  });
}
