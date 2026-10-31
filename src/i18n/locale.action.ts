"use server";

import { cookies } from "next/headers";
import { defaultLocale, locales, Locale } from "./config";

const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export async function setUserLocale(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  if (locales.includes(locale)) {
    cookieStore.set(LOCALE_COOKIE_NAME, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
  }
}

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  return rawLocale && locales.includes(rawLocale as Locale)
    ? (rawLocale as Locale)
    : defaultLocale;
}
