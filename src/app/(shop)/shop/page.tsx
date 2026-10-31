import React from "react";
import { HomePage } from "@/app/(shop)/home/components/HomePage";
import { HomeIntlProvider } from "@/app/(shop)/home/components/HomeIntlProvider";
import { getHomeLocale, getHomeMessages } from "@/i18n/server";

export default async function ShopHomePage() {
  const locale = await getHomeLocale();
  const messages = await getHomeMessages(locale);

  return (
    <HomeIntlProvider locale={locale} messages={messages}>
      <HomePage />
    </HomeIntlProvider>
  );
}
