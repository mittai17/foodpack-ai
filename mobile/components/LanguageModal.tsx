import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Spacing, BorderRadius } from '@/constants/colors';
import { useAppTheme, type ThemeColors } from '@/lib/theme/theme-store';
import {
  useLanguageStore,
  LOCALES,
  type SupportedLocale,
} from '@/lib/i18n/language-store';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LanguageModal({ visible, onClose }: LanguageModalProps) {
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { locale, setLocale } = useLanguageStore();

  const handleSelect = (code: SupportedLocale) => {
    Haptics.selectionAsync();
    setLocale(code);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Language / भाषा / மொழி</Text>
              <Text style={styles.subtitle}>
                Choose your preferred interface language
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
              onPress={onClose}
              hitSlop={8}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {/* Languages list */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {LOCALES.map((item) => {
              const isSelected = item.code === locale;
              return (
                <Pressable
                  key={item.code}
                  style={({ pressed }) => [
                    styles.item,
                    isSelected && styles.itemSelected,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => handleSelect(item.code)}
                >
                  <View style={styles.itemLeft}>
                    <Text style={styles.flag}>{item.flag}</Text>
                    <View>
                      <Text style={[styles.nativeName, isSelected && styles.selectedText]}>
                        {item.nativeName}
                      </Text>
                      <Text style={styles.englishName}>{item.name}</Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.radio,
                      isSelected && styles.radioSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Cancel button */}
          <Pressable
            style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.8 }]}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Done / पूर्ण</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: ThemeColors, isDark: boolean) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.background.card,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: colors.background.border,
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.sm,
      paddingBottom: Spacing.xl,
      maxHeight: '80%',
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? '#3d3627' : '#d8ceb8',
      alignSelf: 'center',
      marginBottom: Spacing.sm,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
      paddingBottom: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.background.border,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Inter-Bold',
      color: colors.content.primary,
    },
    subtitle: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
      marginTop: 2,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background.elevated,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.background.border,
    },
    closeText: {
      color: colors.content.muted,
      fontSize: 14,
      fontFamily: 'Inter-Medium',
    },
    list: {
      marginBottom: Spacing.md,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: Spacing.md,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.background.border,
      marginBottom: 8,
      backgroundColor: colors.background.card,
    },
    itemSelected: {
      borderColor: colors.primary.DEFAULT,
      backgroundColor: colors.primary.muted,
    },
    itemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    flag: {
      fontSize: 24,
    },
    nativeName: {
      fontSize: 15,
      fontFamily: 'Inter-SemiBold',
      color: colors.content.primary,
    },
    englishName: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: colors.content.muted,
      marginTop: 1,
    },
    selectedText: {
      color: colors.primary.DEFAULT,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.content.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: {
      borderColor: colors.primary.DEFAULT,
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary.DEFAULT,
    },
    cancelBtn: {
      backgroundColor: colors.primary.DEFAULT,
      borderRadius: BorderRadius.lg,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: Spacing.xs,
    },
    cancelText: {
      color: isDark ? '#0b1f13' : '#ffffff',
      fontFamily: 'Inter-Bold',
      fontSize: 15,
    },
  });
}
