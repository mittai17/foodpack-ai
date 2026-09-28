import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const Layout = {
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  /** Base horizontal padding — NEVER go below 16 on any screen */
  horizontalPadding: 16,
  /** Standard vertical padding between sections */
  sectionPadding: 24,
  /** Tab bar height (approximate, safe-area is applied on top) */
  tabBarHeight: 56,
  /** Bottom safe area clearance for content scroll */
  bottomContentPadding: 80,
  /** Card inner padding */
  cardPadding: 16,
} as const;

export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';

export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;
