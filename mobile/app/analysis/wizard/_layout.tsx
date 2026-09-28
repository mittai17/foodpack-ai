import { Stack } from 'expo-router';
import { useAppTheme } from '@/lib/theme/theme-store';

export default function WizardLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.DEFAULT },
        animation: 'slide_from_right',
      }}
    />
  );
}
