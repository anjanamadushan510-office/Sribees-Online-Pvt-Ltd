"use client";

import React, { useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";

interface AppIntlProviderProps {
  locale: string;
  messages: Record<string, unknown>;
  children: React.ReactNode;
}

export const AppIntlProvider: React.FC<AppIntlProviderProps> = ({
  locale,
  messages,
  children,
}) => {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      if (locale === "si") {
        document.documentElement.classList.add("font-sinhala");
      } else {
        document.documentElement.classList.remove("font-sinhala");
      }
    }
  }, [locale]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Asia/Colombo"
    >
      <div className={locale === "si" ? "font-sinhala" : undefined}>
        {children}
      </div>
    </NextIntlClientProvider>
  );
};

export default AppIntlProvider;
