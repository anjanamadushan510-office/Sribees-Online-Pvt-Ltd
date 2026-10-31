import { LanguageCode } from "@/interfaces/accountSettings.interface";

export const locales = ["en", "si", "ta"] as const;
export type Locale = LanguageCode;
export const defaultLocale: Locale = "en";

export interface LocaleDetail {
  code: Locale;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LOCALES: LocaleDetail[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
  },
  {
    code: "si",
    name: "Sinhala",
    nativeName: "සිංහල",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
  },
];

export const isSupportedLocale = (val: string): val is Locale => {
  return locales.includes(val as Locale);
};
