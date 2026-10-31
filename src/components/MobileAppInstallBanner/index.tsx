"use client";

import React, { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { PLAYSTORE_LINK } from "@/constants/links";
import { STORAGE_KEYS } from "@/constants/storageKeys";

export const MobileAppInstallBanner: React.FC = () => {
  const t = useTranslations("common.mobileAppBanner");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem(
        STORAGE_KEYS.MOBILE_APP_BANNER_DISMISSED
      );
      if (!isDismissed) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem(
        STORAGE_KEYS.MOBILE_APP_BANNER_DISMISSED,
        "true"
      );
    } catch {
      // ignore storage errors
    }
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Mobile app download"
      className="md:hidden relative bg-slate-950 text-white px-3 py-2 border-b border-slate-800 transition-all duration-300 ease-in-out shadow-sm animate-fadeIn z-50"
    >
      <div className="flex items-center justify-between gap-2.5">
        {/* Left: Close Button & App Icon & App Details */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={t("close")}
            className="p-1.5 -ml-1 text-slate-400 hover:text-white rounded-full transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>

          {/* App Icon */}
          <div className="w-9 h-9 rounded-xl bg-white p-1 border border-slate-800 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src="/base/logo.png"
              alt="SRIBEES logo"
              className="w-full h-full object-contain"
            />
          </div>

          {/* App Titles */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-extrabold text-xs text-white truncate tracking-tight">
                {t("title")}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1 py-0.2 rounded shrink-0">
                <span>4.9</span>
                <Star className="w-2.5 h-2.5 fill-amber-400" />
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Right: Install Action Button */}
        <a
          href={PLAYSTORE_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3.5 py-1.5 bg-[#D81B60] hover:bg-[#C2185B] text-white text-[11px] font-black rounded-full uppercase tracking-wider shadow-sm active:scale-95 transition-all text-center leading-none"
        >
          {t("action")}
        </a>
      </div>
    </aside>
  );
};

export default MobileAppInstallBanner;
