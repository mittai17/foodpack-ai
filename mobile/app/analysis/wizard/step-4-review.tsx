import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PRODUCT_STATE_LABELS, TRANSPORT_LABELS,
  OBJECTIVE_LABELS, PACKAGING_FORMAT_LABELS,
} from '@foodpack/shared';
import { useWizardStore } from '@/hooks/useWizardStore';
import { useLanguageStore, getFoodName, getStorageLabel } from '@/lib/i18n/language-store';
import { analysisApi } from '@/lib/api/analysis';
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

function ReviewRow({
  label,
  value,
  onEdit,
  styles,
}: {
  label: string;
  value: string;
  onEdit?: () => void;
  styles: ReturnType<typeof createRowStyles>;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {onEdit && (
        <Pressable style={styles.editBtn} onPress={onEdit}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function Step4ReviewScreen() {
  const router = useRouter();
  const wizard = useWizardStore();
  const queryClient = useQueryClient();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const rowStyles = useMemo(() => createRowStyles(colors), [colors]);
  const { locale, t } = useLanguageStore();

  const mutation = useMutation({
    mutationFn: () =>
      analysisApi.create({
        foodId: wizard.foodId!,
        productState: wizard.productState,
        storageType: wizard.storageType,
        transportType: wizard.transportType,
        packagingFormat: wizard.packagingFormat,
        targetShelfLifeDays: wizard.targetShelfLifeDays,
        packageWeightKg: wizard.packageWeightKg,
        objective: wizard.objective,
        advancedMode: wizard.advancedMode,
        advancedInputs: wizard.advancedMode ? wizard.advancedInputs : undefined,
      }),
    onSuccess: (res) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['analysis'] });
      wizard.reset();
      router.replace(`/analysis/${res.data.id}/results`);
    },
    onError: (err: unknown) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Analysis Failed', (err as { message?: string }).message ?? 'Please try again.');
    },
  });

  const handleAnalyse = () => {
    if (!wizard.foodId) {
      Alert.alert('No food selected', 'Please go back and select a food item.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    mutation.mutate();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <WizardProgress step={4} colors={colors} />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('back_btn', locale)}</Text>
          </Pressable>
          <Text style={styles.stepLabel}>
            {locale === 'hi' ? 'चरण 5 / 5' : locale === 'ta' ? 'படி 5 / 5' : locale === 'te' ? 'దశ 5 / 5' : locale === 'kn' ? 'ಹಂತ 5 / 5' : locale === 'ml' ? 'ഘട്ടം 5 / 5' : 'Step 5 of 5'}
          </Text>
        </View>
        <Text style={styles.title}>Review & Analyse</Text>
        <Text style={styles.subtitle}>Confirm your inputs before running the analysis.</Text>

        {/* Summary card */}
        <View style={styles.card}>
          <ReviewRow
            label="Food / Commodity"
            value={getFoodName(wizard.selectedFood, locale) || wizard.selectedFood?.name || wizard.foodId || '—'}
            onEdit={() => router.push('/analysis/wizard/step-0-food')}
            styles={rowStyles}
          />
          <ReviewRow
            label="Product State"
            value={PRODUCT_STATE_LABELS[wizard.productState]}
            onEdit={() => router.push('/analysis/wizard/step-1-details')}
            styles={rowStyles}
          />
          <ReviewRow
            label="Storage"
            value={getStorageLabel(wizard.storageType, locale)}
            styles={rowStyles}
          />
          <ReviewRow
            label="Transport"
            value={TRANSPORT_LABELS[wizard.transportType]}
            styles={rowStyles}
          />
          <ReviewRow
            label="Packaging Format"
            value={PACKAGING_FORMAT_LABELS[wizard.packagingFormat]}
            onEdit={() => router.push('/analysis/wizard/step-1-details')}
            styles={rowStyles}
          />
          <ReviewRow
            label="Target Shelf Life"
            value={`${wizard.targetShelfLifeDays} ${t('days_target', locale)}`}
            onEdit={() => router.push('/analysis/wizard/step-2-parameters')}
            styles={rowStyles}
          />
          <ReviewRow
            label="Pack Weight"
            value={`${wizard.packageWeightKg} kg`}
            styles={rowStyles}
          />
          <ReviewRow
            label="Objective"
            value={OBJECTIVE_LABELS[wizard.objective]}
            onEdit={() => router.push('/analysis/wizard/step-2-parameters')}
            styles={rowStyles}
          />
          {wizard.advancedMode && (
            <ReviewRow
              label="Advanced Overrides"
              value="Enabled"
              onEdit={() => router.push('/analysis/wizard/step-3-advanced')}
              styles={rowStyles}
            />
          )}
        </View>

        {/* Analyse CTA */}
        <Pressable
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          onPress={handleAnalyse}
          disabled={mutation.isPending}
        >
          <View style={styles.analyseBtn}>
            {mutation.isPending ? (
              <ActivityIndicator color={isDark ? '#0b1f13' : '#ffffff'} />
            ) : (
              <Text style={styles.analyseBtnText}>
                ⚗ {locale === 'hi' ? 'विश्लेषण चलाएं' : locale === 'ta' ? 'பகுப்பாய்வை இயக்கவும்' : locale === 'te' ? 'విశ్లేషణను అమలు చేయండి' : locale === 'kn' ? 'ವಿಶ್ಲೇಷಣೆ ನಡೆಸಿ' : locale === 'ml' ? 'വിശകലനം പ്രവർത്തിപ്പിക്കുക' : 'Run Analysis'}
              </Text>
            )}
          </View>
        </Pressable>

        {mutation.isPending && (
          <Text style={styles.processingText}>
            Running deterministic recommendation engine…
          </Text>
        )}
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
    subtitle: { fontSize: Typography.size.sm, fontFamily: 'Inter-Regular', color: colors.content.secondary, marginBottom: Spacing.lg },
    card: { backgroundColor: colors.background.card, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: colors.background.border, overflow: 'hidden', marginBottom: Spacing.xl },
    analyseBtn: { backgroundColor: colors.primary.DEFAULT, borderRadius: BorderRadius.lg, paddingVertical: 18, alignItems: 'center', marginBottom: Spacing.sm },
    analyseBtnText: { fontSize: Typography.size.lg, fontFamily: 'Inter-Bold', color: isDark ? '#0b1f13' : '#ffffff' },
    processingText: { fontSize: Typography.size.sm, fontFamily: 'Inter-Regular', color: colors.content.secondary, textAlign: 'center', fontStyle: 'italic' },
  });
}

function createRowStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: colors.background.border },
    left: { flex: 1 },
    label: { fontSize: Typography.size.xs, fontFamily: 'Inter-Regular', color: colors.content.muted },
    value: { fontSize: Typography.size.base, fontFamily: 'Inter-Medium', color: colors.content.primary, marginTop: 2 },
    editBtn: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, minHeight: 36, justifyContent: 'center' },
    editText: { fontSize: Typography.size.sm, fontFamily: 'Inter-Medium', color: colors.primary.DEFAULT },
  });
}
