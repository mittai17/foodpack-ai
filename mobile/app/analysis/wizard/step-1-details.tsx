import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  PRODUCT_STATES,
  STORAGE_TYPES,
  TRANSPORT_TYPES,
  PACKAGING_FORMATS,
  type ProductState, type StorageType, type TransportType, type PackagingFormat,
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
            flex: 1, height: 4, borderRadius: 2,
            backgroundColor: i <= step ? colors.primary.DEFAULT : colors.background.border,
          }}
        />
      ))}
    </View>
  );
}

function RadioGroup<T extends string>({
  title,
  options,
  labels,
  value,
  onChange,
  styles,
}: {
  title: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldTitle}>{title}</Text>
      {options.map((opt) => (
        <Pressable
          key={opt}
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onChange(opt);
          }}
        >
          <View style={[styles.radioItem, value === opt && styles.radioItemSelected]}>
            <View style={styles.radioItemRow}>
              <View style={[styles.radioCircle, value === opt && styles.radioCircleSelected]}>
                {value === opt && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.radioLabel, value === opt && styles.radioLabelSelected]}>
                {labels[opt]}
              </Text>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export default function Step1DetailsScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { locale, t } = useLanguageStore();
  const {
    productState, setProductState,
    storageType, setStorageType,
    transportType, setTransportType,
    packagingFormat, setPackagingFormat,
  } = useWizardStore();

  const productStateLabels: Record<ProductState, string> = {
    FRESH: t('state_fresh', locale),
    CUT_READY_TO_EAT: t('state_cut', locale),
    DRIED: t('state_dried', locale),
    PROCESSED: t('state_processed', locale),
    FROZEN: t('state_frozen', locale),
    POWDERED: t('state_powdered', locale),
    LIQUID: t('state_liquid', locale),
  };

  const storageLabels: Record<StorageType, string> = {
    AMBIENT: t('storage_ambient_desc', locale),
    CHILLED: t('storage_chilled_desc', locale),
    FROZEN: t('storage_frozen_desc', locale),
  };

  const transportLabels: Record<TransportType, string> = {
    LOCAL: t('transport_local', locale),
    LONG_DISTANCE: t('transport_long', locale),
    EXPORT: t('transport_export', locale),
  };

  const formatLabels: Record<PackagingFormat, string> = {
    AUTO: t('format_auto', locale),
    POUCH: t('format_pouch', locale),
    TRAY: t('format_tray', locale),
    BOTTLE: t('format_bottle', locale),
    BAG: t('format_bag', locale),
    BOX: t('format_box', locale),
    JAR: t('format_jar', locale),
    SACHET: t('format_sachet', locale),
    CLAMSHELL: t('format_clamshell', locale),
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <WizardProgress step={1} colors={colors} />

        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← {t('back_btn', locale)}</Text>
          </Pressable>
          <Text style={styles.step}>
            {locale === 'hi' ? 'चरण 2 / 5' : locale === 'ta' ? 'படி 2 / 5' : locale === 'te' ? 'దశ 2 / 5' : locale === 'kn' ? 'ಹಂತ 2 / 5' : locale === 'ml' ? 'ഘട്ടം 2 / 5' : 'Step 2 of 5'}
          </Text>
        </View>
        <Text style={styles.title}>{t('product_details_title', locale)}</Text>
        <Text style={styles.subtitle}>
          {t('product_details_subtitle', locale)}
        </Text>

        <RadioGroup
          title={t('product_state_label', locale)}
          options={PRODUCT_STATES}
          labels={productStateLabels}
          value={productState}
          onChange={setProductState}
          styles={styles}
        />

        <RadioGroup
          title={t('storage_type_label', locale)}
          options={STORAGE_TYPES}
          labels={storageLabels}
          value={storageType}
          onChange={setStorageType}
          styles={styles}
        />

        <RadioGroup
          title={t('transport_title', locale)}
          options={TRANSPORT_TYPES}
          labels={transportLabels}
          value={transportType}
          onChange={setTransportType}
          styles={styles}
        />

        <RadioGroup
          title={t('packaging_format_title', locale)}
          options={PACKAGING_FORMATS}
          labels={formatLabels}
          value={packagingFormat}
          onChange={setPackagingFormat}
          styles={styles}
        />

        <Pressable
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/analysis/wizard/step-2-parameters');
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
    step: { fontSize: Typography.size.sm, fontFamily: 'Inter-Medium', color: colors.content.muted },
    title: { fontSize: Typography.size['2xl'], fontFamily: 'Inter-Bold', color: colors.content.primary, marginBottom: Spacing.xs },
    subtitle: { fontSize: Typography.size.sm, fontFamily: 'Inter-Regular', color: colors.content.secondary, marginBottom: Spacing.xl, lineHeight: 20 },
    fieldGroup: { marginBottom: Spacing.xl },
    fieldTitle: { fontSize: Typography.size.base, fontFamily: 'Inter-SemiBold', color: colors.content.primary, marginBottom: Spacing.sm },
    radioItem: {
      backgroundColor: colors.background.card,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.background.border,
      marginBottom: Spacing.xs,
      minHeight: 52,
      justifyContent: 'center',
    },
    radioItemRow: { flexDirection: 'row', alignItems: 'center', width: '100%', gap: Spacing.sm },
    radioItemSelected: { borderColor: colors.primary.DEFAULT, backgroundColor: colors.primary.muted },
    radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.content.muted, alignItems: 'center', justifyContent: 'center' },
    radioCircleSelected: { borderColor: colors.primary.DEFAULT },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary.DEFAULT },
    radioLabel: { flex: 1, fontSize: Typography.size.base, fontFamily: 'Inter-Regular', color: colors.content.secondary },
    radioLabelSelected: { color: colors.content.primary, fontFamily: 'Inter-Medium' },
    nextBtn: { backgroundColor: colors.primary.DEFAULT, borderRadius: BorderRadius.lg, paddingVertical: 16, alignItems: 'center' },
    nextBtnText: { fontSize: Typography.size.base, fontFamily: 'Inter-SemiBold', color: isDark ? '#0b1f13' : '#ffffff' },
  });
}
