"use client";

import React, { useState, useEffect } from "react";
import { Bell, Tag, Megaphone, Sliders } from "lucide-react";
import { NotificationPreferences } from "@/interfaces/accountSettings.interface";
import { useToastStore } from "@/state/toast.store";
import {
  useGetNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/api/queries/useNotifications";
import { useTranslations } from "next-intl";

export const NotificationsCard: React.FC = () => {
  const t = useTranslations("account");
  const { data: serverPrefs } = useGetNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();
  const addToast = useToastStore((state) => state.addToast);

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    offers: true,
    promotions: true,
    general: true,
  });

  useEffect(() => {
    if (serverPrefs) {
      setPreferences({
        offers: serverPrefs.offers ?? true,
        promotions: serverPrefs.promotions ?? true,
        general: serverPrefs.general ?? true,
      });
    }
  }, [serverPrefs]);

  const togglePreference = (key: keyof NotificationPreferences, label: string) => {
    const nextValue = !preferences[key];

    setPreferences((prev) => ({ ...prev, [key]: nextValue }));

    updateMutation.mutate(
      { [key]: nextValue },
      {
        onError: () => {
          setPreferences((prev) => ({ ...prev, [key]: !nextValue }));
          addToast({
            title: t("settings.notificationToastTitle"),
            message: t("settings.notificationError", { label }),
            type: "error",
          });
        },
      }
    );

    addToast({
      title: t("settings.notificationToastTitle"),
      message: nextValue
        ? t("settings.notificationEnabled", { label })
        : t("settings.notificationDisabled", { label }),
      type: nextValue ? "success" : "info",
    });
  };

  const notificationItems = [
    {
      key: "offers" as const,
      label: t("settings.offers"),
      description: t("settings.offersDesc"),
      icon: Tag,
      iconBg: "bg-[#D81B60]/10 text-[#D81B60]",
    },
    {
      key: "promotions" as const,
      label: t("settings.promotions"),
      description: t("settings.promotionsDesc"),
      icon: Megaphone,
      iconBg: "bg-amber-100/80 text-amber-600",
    },
    {
      key: "general" as const,
      label: t("settings.general"),
      description: t("settings.generalDesc"),
      icon: Sliders,
      iconBg: "bg-emerald-100/80 text-emerald-600",
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 text-[#D81B60] flex items-center justify-center shrink-0 shadow-2xs">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {t("settings.notificationsTitle")}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t("settings.notificationsDesc")}
            </p>
          </div>
        </div>

        {/* Toggles List */}
        <div className="space-y-3">
          {notificationItems.map((item) => {
            const IconComponent = item.icon;
            const isChecked = preferences[item.key];

            return (
              <div
                key={item.key}
                className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all hover:bg-slate-100/50"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      {item.label}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-snug">
                      {item.description}
                    </p>
                  </div>
                </div>
                {/* Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isChecked}
                  onClick={() => togglePreference(item.key, item.label)}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer shrink-0 flex items-center ${
                    isChecked ? "bg-[#D81B60]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform ${
                      isChecked ? "translate-x-5.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

