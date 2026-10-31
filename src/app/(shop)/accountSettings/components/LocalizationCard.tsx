"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages, Check, Loader2 } from "lucide-react";
import {
  LanguageCode,
  LanguageOption,
} from "@/interfaces/accountSettings.interface";
import { useToastStore } from "@/state/toast.store";
import {
  useGetNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/api/queries/useNotifications";
import { setUserLocale } from "@/i18n/locale.action";
import { useLocale, useTranslations } from "next-intl";

const LANGUAGES: LanguageOption[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    badge: "Default UI",
    description: "Islandwide catalog & receipts in English.",
  },
  {
    code: "si",
    name: "Sinhala",
    nativeName: "සිංහල",
    description: "සිංහල භාෂාවෙන් නාමාවලිය නරඹන්න.",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    description: "தமிழ் மொழியில் மளிகை பொருட்களை உலாவவும்.",
  },
];

export const LocalizationCard: React.FC = () => {
  const t = useTranslations("account");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { data: serverPrefs } = useGetNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();
  const addToast = useToastStore((state) => state.addToast);

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(
    (locale as LanguageCode) || "en",
  );

  useEffect(() => {
    if (serverPrefs?.language) {
      const code = serverPrefs.language.toLowerCase() as LanguageCode;
      if (code === "en" || code === "si" || code === "ta") {
        setSelectedLanguage(code);
      }
    } else if (
      locale &&
      (locale === "en" || locale === "si" || locale === "ta")
    ) {
      setSelectedLanguage(locale as LanguageCode);
    }
  }, [serverPrefs, locale]);

  const handleSave = () => {
    const chosen = LANGUAGES.find((l) => l.code === selectedLanguage);
    updateMutation.mutate(
      { language: selectedLanguage },
      {
        onSuccess: async () => {
          if (typeof document !== "undefined") {
            document.documentElement.lang = selectedLanguage;
            if (selectedLanguage === "si") {
              document.documentElement.classList.add("font-sinhala");
            } else {
              document.documentElement.classList.remove("font-sinhala");
            }
          }
          await setUserLocale(selectedLanguage);
          addToast({
            title: t("settings.languageSaved"),
            message: t("settings.languageSavedDetail", {
              language: chosen?.nativeName || "English",
            }),
            type: "success",
          });
          startTransition(() => {
            router.refresh();
          });
        },
        onError: () => {
          addToast({
            title: t("settings.title"),
            message: t("settings.languageUpdateError"),
            type: "error",
          });
        },
      },
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {t("settings.localizationTitle")}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t("settings.localizationDesc")}
            </p>
          </div>
        </div>

        {/* Language Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setSelectedLanguage(lang.code)}
                className={`text-left p-4 rounded-2xl transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? "bg-rose-50/60 border-2 border-[#D81B60] shadow-xs"
                    : "bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-100/60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {lang.nativeName}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-[#D81B60] text-white"
                            : "border border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">
                    {lang.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Action Button */}
      <div className=" flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={updateMutation.isPending || isPending}
          className="bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-60"
        >
          {updateMutation.isPending || isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{t("settings.saving")}</span>
            </>
          ) : (
            <span>{t("settings.saveLanguage")}</span>
          )}
        </button>
      </div>
    </div>
  );
};
