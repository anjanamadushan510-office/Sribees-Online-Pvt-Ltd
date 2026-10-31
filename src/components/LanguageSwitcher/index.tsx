"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown, Check } from "lucide-react";
import {
  Locale,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  defaultLocale,
} from "@/i18n/config";
import { setUserLocale } from "@/i18n/locale.action";

export const LanguageSwitcher: React.FC = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale>(defaultLocale);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read the current locale from cookie on mount
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
    const cookieLocale = match ? match[1] : defaultLocale;
    if (isSupportedLocale(cookieLocale)) {
      setCurrentLocale(cookieLocale);
      if (typeof document !== "undefined") {
        document.documentElement.lang = cookieLocale;
        if (cookieLocale === "si") {
          document.documentElement.classList.add("font-sinhala");
        } else {
          document.documentElement.classList.remove("font-sinhala");
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectLocale = (locale: Locale) => {
    if (locale === currentLocale) {
      setIsOpen(false);
      return;
    }

    setCurrentLocale(locale);
    setIsOpen(false);

    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      if (locale === "si") {
        document.documentElement.classList.add("font-sinhala");
      } else {
        document.documentElement.classList.remove("font-sinhala");
      }
    }

    startTransition(async () => {
      await setUserLocale(locale);
      router.refresh();
    });
  };

  const activeOption =
    SUPPORTED_LOCALES.find((l) => l.code === currentLocale) ||
    SUPPORTED_LOCALES[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isPending}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-rose-100 hover:text-white hover:bg-rose-700/60 transition-colors cursor-pointer border border-rose-400/40"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Change Language"
      >
        <Globe className="w-3.5 h-3.5 text-amber-300" />
        <span>{activeOption.nativeName}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white text-slate-800 shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-150"
          role="listbox"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            Select Language
          </div>
          {SUPPORTED_LOCALES.map((locale) => {
            const isSelected = locale.code === currentLocale;
            return (
              <button
                key={locale.code}
                type="button"
                onClick={() => handleSelectLocale(locale.code)}
                role="option"
                aria-selected={isSelected}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition-colors cursor-pointer hover:bg-rose-50 hover:text-[#D81B60] ${
                  isSelected
                    ? "text-[#D81B60] font-bold bg-rose-50/60"
                    : "text-slate-700"
                }`}
              >
                <div className="flex flex-col">
                  <span>{locale.nativeName}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {locale.name}
                  </span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#D81B60] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
