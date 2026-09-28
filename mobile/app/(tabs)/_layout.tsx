import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, ColorValue } from 'react-native';
import { useAppTheme } from '@/constants/colors';
import { useLanguageStore, t } from '@/lib/i18n/language-store';

export default function TabsLayout() {
  const { locale } = useLanguageStore();
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background.card,
          borderTopColor: colors.background.border,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: colors.primary.DEFAULT,
        tabBarInactiveTintColor: colors.content.muted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab_dashboard', locale),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="⊞" color={color} focused={focused} activeBg={colors.primary.muted} />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: t('tab_analyse', locale),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="+" color={color} focused={focused} activeBg={colors.primary.muted} />
          ),
        }}
      />
      <Tabs.Screen
        name="foods"
        options={{
          title: t('tab_foods', locale),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="🌿" color={color} focused={focused} activeBg={colors.primary.muted} />
          ),
        }}
      />
      <Tabs.Screen
        name="iot"
        options={{
          title: t('tab_iot', locale),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="⌁" color={color} focused={focused} activeBg={colors.primary.muted} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('tab_more', locale),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon="≡" color={color} focused={focused} activeBg={colors.primary.muted} />
          ),
        }}
      />
      {/* Hidden tabs — still accessible via router.push */}
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

function TabIcon({
  icon,
  color,
  focused,
  activeBg,
}: {
  icon: string;
  color: ColorValue;
  focused: boolean;
  activeBg: string;
}) {
  return (
    <View style={[styles.iconWrap, focused && { backgroundColor: activeBg }]}>
      <Text style={[styles.iconText, { color }]}>{icon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
  },
  tabItem: {
    paddingTop: 4,
  },
  iconWrap: {
    width: 36,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
});
