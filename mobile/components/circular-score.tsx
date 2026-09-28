import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useAppTheme, type ThemeColors } from '@/lib/theme/theme-store';

interface CircularScoreProps {
  value: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
}

export function CircularScore({
  value,
  label = 'Match Score',
  size = 88,
  strokeWidth = 7,
}: CircularScoreProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value > 1 ? value : value * 100));
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 70 ? colors.primary.DEFAULT : clamped >= 40 ? colors.warning.DEFAULT : colors.danger.DEFAULT;
  const tier =
    clamped >= 70 ? 'Excellent' : clamped >= 40 ? 'Moderate' : 'Low Match';

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={styles.svg}>
          {/* Background track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.background.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
          />
        </Svg>
        <View style={styles.centerText}>
          <Text style={[styles.scoreValue, { color }]}>{Math.round(clamped)}</Text>
          <Text style={styles.scoreMax}>/ 100</Text>
        </View>
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.tierBadge, { backgroundColor: `${color}18` }]}>
        <Text style={[styles.tierText, { color }]}>{tier}</Text>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: 4,
    },
    svg: {
      transform: [{ rotate: '-90deg' }],
    },
    centerText: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreValue: {
      fontSize: 22,
      fontFamily: 'Inter-Bold',
      lineHeight: 26,
    },
    scoreMax: {
      fontSize: 10,
      fontFamily: 'Inter-Medium',
      color: colors.content.muted,
    },
    label: {
      fontSize: 12,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.primary,
      marginTop: 2,
    },
    tierBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
    },
    tierText: {
      fontSize: 10,
      fontFamily: 'Inter-Bold',
    },
  });
}
