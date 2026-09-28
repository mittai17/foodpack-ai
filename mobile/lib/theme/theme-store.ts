import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColor = 'green' | 'blue' | 'purple' | 'amber' | 'red';

export interface AccentPreset {
  id: AccentColor;
  label: string;
  color: string;
  darkColor: string;
  lightColor: string;
  darkMuted: string;
  lightMuted: string;
  darkFg: string;
  lightFg: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  {
    id: 'green',
    label: 'Natural Forest (Green)',
    color: '#22c55e',
    darkColor: '#22c55e',
    lightColor: '#15803d',
    darkMuted: '#1c3323',
    lightMuted: '#e3f3e8',
    darkFg: '#0b1f13',
    lightFg: '#ffffff',
  },
  {
    id: 'blue',
    label: 'Ocean Science (Blue)',
    color: '#3b82f6',
    darkColor: '#38bdf8',
    lightColor: '#2563eb',
    darkMuted: '#0c2d48',
    lightMuted: '#dbeafe',
    darkFg: '#082f49',
    lightFg: '#ffffff',
  },
  {
    id: 'purple',
    label: 'BioTech Royal (Purple)',
    color: '#8b5cf6',
    darkColor: '#a78bfa',
    lightColor: '#7c3aed',
    darkMuted: '#2e1065',
    lightMuted: '#ede9fe',
    darkFg: '#2e1065',
    lightFg: '#ffffff',
  },
  {
    id: 'amber',
    label: 'Solar Harvest (Amber)',
    color: '#f59e0b',
    darkColor: '#f59e0b',
    lightColor: '#d97706',
    darkMuted: '#451a03',
    lightMuted: '#fef3c7',
    darkFg: '#451a03',
    lightFg: '#ffffff',
  },
  {
    id: 'red',
    label: 'MoFPI Alert (Red)',
    color: '#ef4444',
    darkColor: '#f87171',
    lightColor: '#dc2626',
    darkMuted: '#450a0a',
    lightMuted: '#fee2e2',
    darkFg: '#450a0a',
    lightFg: '#ffffff',
  },
];

export interface ThemeColors {
  primary: {
    DEFAULT: string;
    light: string;
    dark: string;
    foreground: string;
    muted: string;
    subtleBorder: string;
  };
  background: {
    DEFAULT: string;
    card: string;
    elevated: string;
    border: string;
    sidebar: string;
  };
  content: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  danger: {
    DEFAULT: string;
    light: string;
    muted: string;
  };
  warning: {
    DEFAULT: string;
    light: string;
    muted: string;
  };
  info: {
    DEFAULT: string;
    light: string;
    muted: string;
  };
  success: {
    DEFAULT: string;
    light: string;
    muted: string;
  };
  white: string;
  black: string;
  transparent: string;
}

export function buildThemePalette(isDark: boolean, accentId: AccentColor = 'green'): ThemeColors {
  const accent = ACCENT_PRESETS.find((a) => a.id === accentId) ?? ACCENT_PRESETS[0];

  if (isDark) {
    return {
      primary: {
        DEFAULT: accent.darkColor,
        light: accent.lightColor,
        dark: accent.darkColor,
        foreground: accent.darkFg,
        muted: accent.darkMuted,
        subtleBorder: `${accent.darkColor}33`,
      },
      background: {
        DEFAULT: '#17150f',     // Web .dark --background (warm charcoal)
        card: '#1f1c15',        // Web .dark --card
        elevated: '#2a2519',    // Web .dark --secondary
        border: '#ffffff1a',    // Web .dark --border
        sidebar: '#1b1811',     // Web .dark --sidebar
      },
      content: {
        primary: '#f3efe2',     // Web .dark --foreground
        secondary: '#b3aa93',   // Web .dark --muted-foreground
        muted: '#6f6656',
        inverse: '#17150f',
      },
      danger: {
        DEFAULT: '#f87171',
        light: '#fca5a5',
        muted: '#7f1d1d',
      },
      warning: {
        DEFAULT: '#fbbf24',
        light: '#fde68a',
        muted: '#78350f',
      },
      info: {
        DEFAULT: '#60a5fa',
        light: '#93c5fd',
        muted: '#1e3a8a',
      },
      success: {
        DEFAULT: '#22c55e',
        light: '#86efac',
        muted: '#1c3323',
      },
      white: '#ffffff',
      black: '#000000',
      transparent: 'transparent',
    };
  }

  // Light Mode — exactly mirrors web :root tokens
  return {
    primary: {
      DEFAULT: accent.lightColor,
      light: accent.darkColor,
      dark: accent.lightColor,
      foreground: accent.lightFg,
      muted: accent.lightMuted,
      subtleBorder: `${accent.lightColor}33`,
    },
    background: {
      DEFAULT: '#f6f2e8',     // Web :root --background (warm sand/linen)
      card: '#ffffff',        // Web :root --card
      elevated: '#eee7d6',    // Web :root --secondary / --muted
      border: '#e5dcc6',      // Web :root --border
      sidebar: '#f1ead9',     // Web :root --sidebar
    },
    content: {
      primary: '#221f19',     // Web :root --foreground (rich charcoal)
      secondary: '#6f6656',   // Web :root --muted-foreground
      muted: '#8c816d',
      inverse: '#f6f2e8',
    },
    danger: {
      DEFAULT: '#dc2626',
      light: '#fecaca',
      muted: '#fee2e2',
    },
    warning: {
      DEFAULT: '#d97706',
      light: '#fde68a',
      muted: '#fef3c7',
    },
    info: {
      DEFAULT: '#2563eb',
      light: '#bfdbfe',
      muted: '#dbeafe',
    },
    success: {
      DEFAULT: '#15803d',
      light: '#bbf7d0',
      muted: '#dcfce7',
    },
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  };
}

interface ThemeState {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (accent: AccentColor) => void;
}

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {
      // ignore
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // ignore
    }
  },
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: 'dark',
      accentColor: 'green',
      setThemeMode: (themeMode: ThemeMode) => set({ themeMode }),
      setAccentColor: (accentColor: AccentColor) => set({ accentColor }),
    }),
    {
      name: 'foodpack-theme-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
        accentColor: state.accentColor,
      }),
    }
  )
);

/**
 * Universal hook to get currently resolved active theme, colors, and helpers.
 */
export function useAppTheme() {
  const { themeMode, accentColor, setThemeMode, setAccentColor } = useThemeStore();
  const systemScheme = useColorScheme();

  const isDark =
    themeMode === 'system'
      ? systemScheme === 'dark'
      : themeMode === 'dark';

  const colors = buildThemePalette(isDark, accentColor);

  return {
    themeMode,
    accentColor,
    isDark,
    colors,
    setThemeMode,
    setAccentColor,
  };
}
