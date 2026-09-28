import {
  useAppTheme,
  useThemeStore,
  buildThemePalette,
  ACCENT_PRESETS,
  type ThemeColors,
  type ThemeMode,
  type AccentColor,
  type AccentPreset,
} from '@/lib/theme/theme-store';

export {
  useAppTheme,
  useThemeStore,
  buildThemePalette,
  ACCENT_PRESETS,
  type ThemeColors,
  type ThemeMode,
  type AccentColor,
  type AccentPreset,
};

export const Colors = {
  // Brand — Natural Green (matches web .dark --primary: #22c55e)
  primary: {
    DEFAULT: '#22c55e',
    light: '#86efac',
    dark: '#16a34a',
    foreground: '#0b1f13',
    muted: '#1c3323',       // web .dark --accent
    subtleBorder: '#22c55e33',
  },

  // Warm charcoal surface hierarchy (matches web .dark palette)
  background: {
    DEFAULT: '#17150f',     // web .dark --background
    card: '#1f1c15',        // web .dark --card
    elevated: '#2a2519',    // web .dark --secondary / --muted
    border: '#ffffff1a',    // web .dark --border
    sidebar: '#1b1811',     // web .dark --sidebar
  },

  // Text hierarchy (matches web .dark foreground tokens)
  content: {
    primary: '#f3efe2',     // web .dark --foreground
    secondary: '#b3aa93',   // web .dark --muted-foreground
    muted: '#6f6656',       // approximate mid-tone
    inverse: '#17150f',
  },

  // Semantic colours (web .dark chart / semantic tokens)
  danger:  { DEFAULT: '#f87171', light: '#fca5a5', muted: '#7f1d1d' },
  warning: { DEFAULT: '#fbbf24', light: '#fde68a', muted: '#78350f' },
  info:    { DEFAULT: '#60a5fa', light: '#93c5fd', muted: '#1e3a8a' },
  success: { DEFAULT: '#22c55e', light: '#86efac', muted: '#1c3323' },

  // Misc
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const Typography = {
  fontFamily: {
    sans: 'Inter',
    mono: 'JetBrainsMono',
  },
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,   // base horizontal padding — NEVER go below this
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const TouchTarget = {
  /** Minimum touch target size in points — WCAG + Apple HIG requirement */
  min: 44,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;
