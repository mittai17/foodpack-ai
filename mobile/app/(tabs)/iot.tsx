/**
 * IoT Monitor — matches web /iot page design
 * Live sensor telemetry with scenario simulation, sensor cards, and alert banners.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useWizardStore } from '@/hooks/useWizardStore';
import { useSidebarStore } from '@/hooks/useSidebarStore';
import { useAppTheme, type ThemeColors, Typography, Spacing, BorderRadius } from '@/constants/colors';

// ── Mock IoT stream (ported from web lib/iot-mock.ts) ──

interface SensorReading {
  temperatureC: number;
  relativeHumidityPercent: number;
  co2Ppm: number;
  o2Percent: number;
  respirationRateMlCo2PerKgPerHr: number;
}

const SCENARIOS = {
  optimal: {
    label: '🍏 Optimal Cold Storage',
    base: { temperatureC: 4.1, relativeHumidityPercent: 89.2, co2Ppm: 3250, o2Percent: 3.2, respirationRateMlCo2PerKgPerHr: 28.5 },
    alert: null,
    color: '#22c55e',
  },
  cold_break: {
    label: '🚨 Cold Chain Break',
    base: { temperatureC: 14.8, relativeHumidityPercent: 78.0, co2Ppm: 5100, o2Percent: 15.5, respirationRateMlCo2PerKgPerHr: 62.0 },
    alert: 'Thermal spike detected — microbial risk elevated',
    color: '#f87171',
  },
  high_respiration: {
    label: '💨 High Respiration',
    base: { temperatureC: 8.2, relativeHumidityPercent: 91.0, co2Ppm: 9200, o2Percent: 0.9, respirationRateMlCo2PerKgPerHr: 185.0 },
    alert: 'Hypoxia risk — O₂ below safe threshold',
    color: '#fbbf24',
  },
  condensation: {
    label: '💧 Condensation Surge',
    base: { temperatureC: 6.8, relativeHumidityPercent: 98.8, co2Ppm: 3800, o2Percent: 5.1, respirationRateMlCo2PerKgPerHr: 31.0 },
    alert: 'Condensation risk — potential mold / Botrytis rot',
    color: '#60a5fa',
  },
  map_leak: {
    label: '🕳️ MAP Seal Leak',
    base: { temperatureC: 4.3, relativeHumidityPercent: 88.5, co2Ppm: 820, o2Percent: 18.5, respirationRateMlCo2PerKgPerHr: 29.0 },
    alert: 'O₂ ingress detected — possible hermetic seal breach',
    color: '#fbbf24',
  },
} as const;

type ScenarioKey = keyof typeof SCENARIOS;

function jitter(value: number, range: number): number {
  return value + (Math.random() - 0.5) * range * 2;
}

function generateReading(key: ScenarioKey): SensorReading {
  const base = SCENARIOS[key].base;
  return {
    temperatureC: Math.round(jitter(base.temperatureC, 0.15) * 10) / 10,
    relativeHumidityPercent: Math.round(jitter(base.relativeHumidityPercent, 0.5) * 10) / 10,
    co2Ppm: Math.round(jitter(base.co2Ppm, 50)),
    o2Percent: Math.round(jitter(base.o2Percent, 0.1) * 10) / 10,
    respirationRateMlCo2PerKgPerHr: Math.round(jitter(base.respirationRateMlCo2PerKgPerHr, 1) * 10) / 10,
  };
}

// ── Main Screen ──

export default function IoTScreen() {
  const router = useRouter();
  const { openSidebar } = useSidebarStore();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const sensorStyles = useMemo(() => createSensorStyles(colors, isDark), [colors, isDark]);
  const { setAdvancedMode, setAdvancedInputs, foodId: wizardFoodId } = useWizardStore();
  const [scenario, setScenario] = useState<ScenarioKey>('optimal');
  const [reading, setReading] = useState<SensorReading>(generateReading('optimal'));
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => setReading(generateReading(scenario)), 2400);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, scenario]);

  const handleScenario = (key: ScenarioKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScenario(key);
    setReading(generateReading(key));
  };

  const handleApplyToWizard = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAdvancedMode(true);
    setAdvancedInputs({
      storageTemperatureC: reading.temperatureC,
      relativeHumidityPercent: reading.relativeHumidityPercent,
      respirationRateMlCo2PerKgPerHr: reading.respirationRateMlCo2PerKgPerHr,
    });
    if (!wizardFoodId) {
      router.push('/analysis/wizard/step-0-food');
    } else {
      router.push('/analysis/wizard/step-3-advanced');
    }
  };

  const currentScenario = SCENARIOS[scenario];
  const alert = currentScenario.alert;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header with Hamburger and Settings */}
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
          <Text style={styles.headerBarTitle}>IoT Telemetry</Text>
          <Text style={styles.headerBarSub}>ESP32 Cold Storage Environmental Sensor</Text>
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Device Status Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Live Monitor</Text>
            <Text style={styles.deviceId}>ESP32-S3-LAB-01 · Cold Room Bay #4</Text>
          </View>
          <View style={styles.onlineRow}>
            <View style={styles.dot} />
            <Text style={styles.onlineText}>ONLINE</Text>
          </View>
        </View>

        {/* Status card */}
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusLabel}>Signal</Text>
            <Text style={styles.statusValue}>-58 dBm · 94% WiFi</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusLeft}>
            <Text style={styles.statusLabel}>Interval</Text>
            <Text style={styles.statusValue}>2.4s</Text>
          </View>
          <View style={styles.statusDivider} />
          <Pressable
            style={styles.playBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsPlaying((p) => !p);
            }}
          >
            <Text style={styles.playBtnText}>{isPlaying ? '⏸ Pause' : '▶ Resume'}</Text>
          </Pressable>
        </View>

        {/* Alert banner */}
        {alert && (
          <View style={[styles.alertBanner, { borderColor: currentScenario.color + '66' }]}>
            <Text style={[styles.alertIcon]}>⚠️</Text>
            <Text style={[styles.alertText, { color: currentScenario.color }]}>{alert}</Text>
          </View>
        )}

        {/* Scenario switcher */}
        <Text style={styles.sectionTitle}>Simulation Scenario</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scenarioList}
        >
          {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => {
            const s = SCENARIOS[key];
            return (
              <Pressable
                key={key}
                style={[
                  styles.scenarioChip,
                  scenario === key && { backgroundColor: colors.primary.muted, borderColor: colors.primary.DEFAULT },
                ]}
                onPress={() => handleScenario(key)}
              >
                <Text style={[
                  styles.scenarioChipText,
                  scenario === key && { color: isDark ? colors.primary.light : colors.primary.DEFAULT },
                ]}>
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Sensor grid — 2 × 2 */}
        <Text style={styles.sectionTitle}>Live Sensor Readings</Text>
        <View style={styles.sensorGrid}>
          <SensorCard
            sensor="Sensirion SHT35"
            label="Temperature"
            value={reading.temperatureC.toFixed(1)}
            unit="°C"
            safeMin={0} safeMax={8}
            accentColor={colors.info.DEFAULT}
            sensorStyles={sensorStyles}
          />
          <SensorCard
            sensor="Sensirion SHT35"
            label="Humidity"
            value={reading.relativeHumidityPercent.toFixed(1)}
            unit="% RH"
            safeMin={80} safeMax={95}
            accentColor={colors.primary.DEFAULT}
            sensorStyles={sensorStyles}
          />
          <SensorCard
            sensor="Winsen MH-Z19B"
            label="CO₂"
            value={reading.co2Ppm.toFixed(0)}
            unit="ppm"
            safeMin={300} safeMax={5000}
            accentColor={colors.warning.DEFAULT}
            sensorStyles={sensorStyles}
          />
          <SensorCard
            sensor="Winsen ZE03-O₂"
            label="O₂"
            value={reading.o2Percent.toFixed(1)}
            unit="% O₂"
            safeMin={1} safeMax={21}
            accentColor={colors.danger.DEFAULT}
            sensorStyles={sensorStyles}
          />
        </View>

        {/* Respiration rate card */}
        <LinearGradient
          colors={isDark ? [colors.primary.muted, '#111f14'] : [colors.primary.muted, colors.background.card]}
          style={styles.respCard}
        >
          <Text style={styles.respChip}>Computed Respiration Rate (R_CO₂)</Text>
          <Text style={styles.respValue}>
            {reading.respirationRateMlCo2PerKgPerHr.toFixed(1)}
            <Text style={styles.respUnit}>  mL CO₂/kg·hr</Text>
          </Text>
          <Text style={styles.respFormula}>
            R = (ΔPCO₂ × V_headspace) / (W_pack × Δt)
          </Text>
          <Text style={styles.respMeta}>
            Calculated via closed-system gas delta accumulation
          </Text>

          {/* Apply to Wizard CTA */}
          <Pressable
            style={({ pressed }) => [{ alignSelf: 'flex-start' }, pressed && { opacity: 0.85 }]}
            onPress={handleApplyToWizard}
          >
            <View style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>Apply to Wizard →</Text>
            </View>
          </Pressable>
        </LinearGradient>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sensor Card ──

function SensorCard({
  sensor, label, value, unit, safeMin, safeMax, accentColor, sensorStyles,
}: {
  sensor: string;
  label: string;
  value: string;
  unit: string;
  safeMin: number;
  safeMax: number;
  accentColor: string;
  sensorStyles: any;
}) {
  const numVal = parseFloat(value);
  const inRange = numVal >= safeMin && numVal <= safeMax;
  const statusColor = inRange ? '#22c55e' : '#f87171';

  return (
    <View style={[sensorStyles.card, { borderTopColor: accentColor }]}>
      <Text style={sensorStyles.sensor}>{sensor}</Text>
      <Text style={sensorStyles.label}>{label}</Text>
      <Text style={[sensorStyles.value, { color: accentColor }]}>
        {value} <Text style={sensorStyles.unit}>{unit}</Text>
      </Text>
      <View style={[sensorStyles.pill, { backgroundColor: statusColor + '22' }]}>
        <Text style={[sensorStyles.pillText, { color: statusColor }]}>
          {inRange ? '✓ In range' : '⚠ Out of range'}
        </Text>
      </View>
      <Text style={sensorStyles.range}>Safe: {safeMin}–{safeMax} {unit}</Text>
    </View>
  );
}

// ── Styles ──

const createStyles = (C: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background.DEFAULT },
  content: { paddingHorizontal: Spacing.md, paddingBottom: 80 },

  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
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
  headerBarTitle: {
    fontSize: 17,
    fontFamily: 'Inter-Bold',
    color: C.content.primary,
  },
  headerBarSub: {
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontFamily: 'Inter-Bold',
    color: C.content.primary,
  },
  deviceId: {
    fontSize: Typography.size.xs,
    fontFamily: 'Inter-Regular',
    color: C.content.secondary,
    marginTop: 2,
  },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.success.DEFAULT },
  onlineText: {
    fontSize: Typography.size.xs,
    fontFamily: 'Inter-SemiBold',
    color: C.success.DEFAULT,
  },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.background.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: C.background.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  statusLeft: { flex: 1 },
  statusLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: C.content.muted,
  },
  statusValue: {
    fontSize: Typography.size.xs,
    fontFamily: 'Inter-Medium',
    color: C.content.primary,
    marginTop: 2,
  },
  statusDivider: { width: 1, height: 28, backgroundColor: C.background.border },
  playBtn: {
    backgroundColor: C.primary.muted,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.primary.DEFAULT + '44',
  },
  playBtnText: {
    fontSize: Typography.size.xs,
    fontFamily: 'Inter-Medium',
    color: isDark ? C.primary.light : C.primary.DEFAULT,
  },

  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: C.danger.muted,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  alertIcon: { fontSize: 18 },
  alertText: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontFamily: 'Inter-Medium',
    lineHeight: 20,
  },

  sectionTitle: {
    fontSize: Typography.size.lg,
    fontFamily: 'Inter-SemiBold',
    color: C.content.primary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },

  scenarioList: { gap: Spacing.sm, paddingRight: Spacing.md, marginBottom: Spacing.lg },
  scenarioChip: {
    backgroundColor: C.background.card,
    borderWidth: 1,
    borderColor: C.background.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 40,
    justifyContent: 'center',
  },
  scenarioChipText: {
    fontSize: Typography.size.sm,
    fontFamily: 'Inter-Medium',
    color: C.content.secondary,
  },

  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  respCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: C.primary.DEFAULT + '33',
    marginBottom: Spacing.md,
  },
  respChip: {
    fontSize: Typography.size.xs,
    fontFamily: 'Inter-Medium',
    color: isDark ? C.primary.light : C.primary.DEFAULT,
    marginBottom: Spacing.sm,
  },
  respValue: {
    fontSize: Typography.size['2xl'],
    fontFamily: 'Inter-Bold',
    color: C.primary.DEFAULT,
    marginBottom: 4,
  },
  respUnit: {
    fontSize: Typography.size.sm,
    fontFamily: 'Inter-Regular',
    color: C.content.secondary,
  },
  respFormula: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: C.content.muted,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  respMeta: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: C.content.secondary,
    marginBottom: Spacing.md,
  },
  applyBtn: {
    alignSelf: 'flex-start',
    backgroundColor: C.primary.DEFAULT,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  applyBtnText: {
    fontSize: Typography.size.sm,
    fontFamily: 'Inter-SemiBold',
    color: isDark ? '#0b1f13' : '#ffffff',
  },
});

const createSensorStyles = (C: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: C.background.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: C.background.border,
    borderTopWidth: 3,
  },
  sensor: {
    fontSize: 9,
    fontFamily: 'Inter-Regular',
    color: C.content.muted,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: Typography.size.sm,
    fontFamily: 'Inter-Medium',
    color: C.content.secondary,
    marginBottom: Spacing.sm,
  },
  value: {
    fontSize: Typography.size.xl,
    fontFamily: 'Inter-Bold',
    marginBottom: Spacing.sm,
  },
  unit: {
    fontSize: Typography.size.sm,
    fontFamily: 'Inter-Regular',
    color: C.content.secondary,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginBottom: 4,
  },
  pillText: { fontSize: 10, fontFamily: 'Inter-Medium' },
  range: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: C.content.muted,
  },
});
