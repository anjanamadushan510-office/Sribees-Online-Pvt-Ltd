import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, locales, Locale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
    if (cookieLocale && locales.includes(cookieLocale as Locale)) {
      locale = cookieLocale;
    } else {
      locale = defaultLocale;
    }
  }

  const safeLocale: Locale = locales.includes(locale as Locale)
    ? (locale as Locale)
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
    locale: safeLocale,
    messages: {
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
    },
  };
});
