"use client";

import Link from "next/link";
import { User, MapPin, CreditCard, Package, Gift } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useTranslations } from "next-intl";

export type AccountTabKey =
  | "personal_info"
  | "saved_addresses"
  | "wallet"
  | "orders";

interface AccountNavigationTabsProps {
  activeTab: AccountTabKey;
  onTabChange: (tab: AccountTabKey) => void;
  savedAddressesCount?: number;
  ordersCount?: number;
}

export const AccountNavigationTabs: React.FC<AccountNavigationTabsProps> = ({
  activeTab,
  onTabChange,
  savedAddressesCount = 3,
  ordersCount = 18,
}) => {
  const t = useTranslations("account.navTabs");

  const tabs = [
    {
      id: "personal_info" as AccountTabKey,
      label: t("personalInfo"),
      icon: User,
    },
    {
      id: "saved_addresses" as AccountTabKey,
      label: `${t("savedAddresses")} (${savedAddressesCount})`,
      icon: MapPin,
    },
    {
      id: "wallet" as AccountTabKey,
      label: t("cashBackHistory"),
      icon: CreditCard,
    },
    {
      id: "orders" as AccountTabKey,
      label: `${t("orderHistory")} (${ordersCount})`,
      icon: Package,
    },
  ];

  return (
    <div className="bg-slate-100/90 p-1.5 rounded-2xl flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar border border-slate-200/80 mb-6">
      <div className="flex items-center gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-[#D81B60] shadow-xs border border-slate-200/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-[#D81B60]" : "text-slate-500"}`}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <Link
        href={ROUTES.REFERRAL}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs hover:from-rose-600 hover:to-amber-600 transition-all whitespace-nowrap shrink-0"
      >
        <Gift className="w-4 h-4 text-yellow-200 animate-bounce" />
        <span>{t("referEarn")}</span>
      </Link>
    </div>
  );
};
