'use server';

import { cookies } from 'next/headers';
import { isValidLocale, type Locale } from './config';

/**
 * Server Action: set the NEXT_LOCALE cookie and return the new locale.
 */
export async function setLocale(locale: Locale): Promise<Locale> {
  if (!isValidLocale(locale)) return 'en';

  const cookieStore = await cookies();
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });

  return locale;
}
