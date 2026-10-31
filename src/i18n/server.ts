import { getUserLocale } from "./locale.action";
import { Locale, defaultLocale, locales } from "./config";

export async function getAppLocale(): Promise<Locale> {
  return getUserLocale();
}

export const getHomeLocale = getAppLocale;

/**
 * Loads all modular page translation files for the active locale.
 */
export async function getAppMessages(
  locale?: Locale
): Promise<Record<string, unknown>> {
  const activeLocale = locale || (await getAppLocale());
  const safeLocale: Locale = locales.includes(activeLocale)
    ? activeLocale
    : defaultLocale;

  const [
    home,
    common,
    categories,
    product,
    checkout,
    savedItems,
    orderHistory,
    promotions,
    referral,
    account,
  ] = await Promise.all([
    import(`../../locales/${safeLocale}/home.json`).then((m) => m.default).catch(() => ({})),
    import(`../../locales/${safeLocale}/common.json`).then((m) => m.default).catch(() => ({})),
    import(`../../locales/${safeLocale}/categories.json`).then((m) => m.default).catch(() => ({})),
    import(`../../locales/${safeLocale}/product.json`).then((m) => m.default).catch(() => ({})),
    import(`../../locales/${safeLocale}/checkout.json`).then((m) => m.default).catch(() => ({})),
    import(`../../locales/${safeLocale}/savedItems.json`).then((m) => m.default).catch(() => ({})),
    import(`../../locales/${safeLocale}/orderHistory.json`).then((m) => m.default).catch(() => ({})),
    import(`../../locales/${safeLocale}/promotions.json`).then((m) => m.default).catch(() => ({})),
    import(`../../locales/${safeLocale}/referral.json`).then((m) => m.default).catch(() => ({})),
    import(`../../locales/${safeLocale}/account.json`).then((m) => m.default).catch(() => ({})),
  ]);

  return {
    home,
    common,
    categories,
    product,
    checkout,
    savedItems,
    orderHistory,
    promotions,
    referral,
    account,
  };
}

export const getHomeMessages = getAppMessages;
