import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import {
  type SupportedLocale,
  LOCALES,
  BRAND_NAMES,
  FOOD_TRANSLATIONS,
  CATEGORY_TRANSLATIONS,
  STORAGE_TRANSLATIONS,
  STATUS_TRANSLATIONS,
  UI_TRANSLATIONS,
} from './translations';

interface LanguageState {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: keyof typeof UI_TRANSLATIONS, locale?: SupportedLocale) => string;
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

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      locale: 'en',
      setLocale: (locale: SupportedLocale) => set({ locale }),
      t: (key: keyof typeof UI_TRANSLATIONS, loc?: SupportedLocale) => t(key, loc ?? get().locale ?? 'en'),
    }),
    {
      name: 'foodpack-language-en',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);

/**
 * Return localized food commodity name.
 */
export function getFoodName(
  food: { slug?: string; name?: string } | string | undefined | null,
  locale: SupportedLocale = 'en'
): string {
  if (!food) return '';
  if (typeof food === 'string') {
    const slug = food.toLowerCase().trim();
    if (FOOD_TRANSLATIONS[slug]?.[locale]) {
      return FOOD_TRANSLATIONS[slug][locale];
    }
    const nameKey = food.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (FOOD_TRANSLATIONS[nameKey]?.[locale]) {
      return FOOD_TRANSLATIONS[nameKey][locale];
    }
    return food;
  }
  const slug = food.slug?.toLowerCase().trim();
  if (slug && FOOD_TRANSLATIONS[slug]?.[locale]) {
    return FOOD_TRANSLATIONS[slug][locale];
  }
  const nameKey = food.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (nameKey && FOOD_TRANSLATIONS[nameKey]?.[locale]) {
    return FOOD_TRANSLATIONS[nameKey][locale];
  }
  return food.name ?? '';
}

/**
 * Return localized category name.
 */
export function getCategoryName(
  category: { slug?: string; name?: string } | string | undefined | null,
  locale: SupportedLocale = 'en'
): string {
  if (!category) return '';
  const slug = typeof category === 'string' ? category.toLowerCase().trim() : category.slug?.toLowerCase().trim();
  if (slug && CATEGORY_TRANSLATIONS[slug]?.[locale]) {
    return CATEGORY_TRANSLATIONS[slug][locale];
  }
  if (typeof category === 'object' && category.name) {
    const nameKey = category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (nameKey && CATEGORY_TRANSLATIONS[nameKey]?.[locale]) {
      return CATEGORY_TRANSLATIONS[nameKey][locale];
    }
    return category.name;
  }
  return String(category);
}

/**
 * Return localized storage mode label.
 */
export function getStorageLabel(
  storageType: string | undefined | null,
  locale: SupportedLocale = 'en'
): string {
  if (!storageType) return '';
  return STORAGE_TRANSLATIONS[storageType]?.[locale] ?? storageType;
}

/**
 * Return localized status label.
 */
export function getStatusLabel(
  status: string | undefined | null,
  locale: SupportedLocale = 'en'
): string {
  if (!status) return '';
  return STATUS_TRANSLATIONS[status]?.[locale] ?? status;
}

/**
 * Return localized UI string.
 */
export function t(
  key: keyof typeof UI_TRANSLATIONS,
  locale: SupportedLocale = 'en'
): string {
  return UI_TRANSLATIONS[key]?.[locale] ?? UI_TRANSLATIONS[key]?.en ?? String(key);
}

/**
 * Return localized brand title.
 */
export function getBrandName(locale: SupportedLocale = 'en'): string {
  return BRAND_NAMES[locale] ?? BRAND_NAMES.en;
}

export { LOCALES, type SupportedLocale };
