"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import {
  User as UserIcon,
  ShoppingBag,
  Truck,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Award,
  Heart,
  Store,
  Layers,
  Sparkles,
  Settings,
  Gift,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { PLAYSTORE_LINK } from "@/constants/links";
import { useUIStore } from "@/state/ui.store";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/state/auth.store";
import { useLogout } from "@/api/queries/useAuth";
import { useToastStore } from "@/state/toast.store";

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { Avatar } from "@/components/Avatar";

interface UserDropdownProps {
  showMobileSubHeader?: boolean;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  showMobileSubHeader = true,
}) => {
  const {
    isUserDropdownOpen,
    closeUserDropdown,
    userProfile: fallbackProfile,
  } = useUIStore();

  const t = useTranslations("common.userDropdown");

  useBodyScrollLock(isUserDropdownOpen);

  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();
  const addToast = useToastStore((state) => state.addToast);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking or touching outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !(target as HTMLElement)?.closest?.('[data-dropdown-trigger="user"]')
      ) {
        closeUserDropdown();
      }
    };

    if (isUserDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, {
        passive: true,
      });
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isUserDropdownOpen, closeUserDropdown]);

  if (!isUserDropdownOpen) return null;

  const mobileTopClass = showMobileSubHeader ? "top-[112px]" : "top-[64px]";

  const displayName = user?.fullName || fallbackProfile?.name || "Customer";
  const displayEmailOrPhone =
    user?.email || user?.phone || fallbackProfile?.email || "";
  const avatarUrl = user?.profilePictureUrl || fallbackProfile?.avatarUrl || "";

  const handleLogout = async () => {
    closeUserDropdown();
    try {
      if (isAuthenticated) {
        await logoutMutation.mutateAsync();
      }
    } catch {
      // Fallback handled by useLogout onSettled
    }
    addToast({
      title: "Logged Out",
      message: "You have been logged out successfully.",
      type: "info",
    });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 md:hidden"
        onClick={closeUserDropdown}
      />

      <div
        ref={dropdownRef}
        className={`fixed left-3 right-3 ${mobileTopClass} md:absolute md:left-auto md:right-0 md:top-full md:mt-3 md:w-[320px] bg-white rounded-3xl shadow-2xl shadow-slate-300/60 border border-slate-100 z-50 overflow-hidden transform transition-all animate-fadeInDown`}
      >
        {/* Top Pointer Arrow for Desktop */}
        <div className="hidden md:block absolute -top-2 right-6 w-4 h-4 bg-white border-t border-l border-slate-100 rotate-45 z-10" />

        {/* User Card Header */}
        <div className="relative z-20 p-4 border-b border-slate-100 bg-gradient-to-br from-rose-50/60 via-white to-amber-50/30">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <Avatar
                src={avatarUrl}
                name={displayName}
                size="md"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-extrabold text-slate-900 truncate">
                  {displayName}
                </h4>
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                {displayEmailOrPhone}
              </p>
            </div>
          </div>
        </div>

        {/* Dropdown Navigation Menu */}
        <div className="p-2 space-y-1">
          {/* My Account */}
          <Link
            href="/myAccount"
            onClick={closeUserDropdown}
            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-rose-50/60 text-slate-700 hover:text-[#D81B60] transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-[#D81B60] text-slate-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold group-hover:text-[#D81B60]">
                  {t("myAccount")}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D81B60] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {t("myAccountDesc")}
              </p>
            </div>
          </Link>

          {/* My Orders */}
          <Link
            href="/orderHistory"
            onClick={closeUserDropdown}
            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-rose-50/60 text-slate-700 hover:text-[#D81B60] transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-[#D81B60] text-slate-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold group-hover:text-[#D81B60]">
                  {t("myOrders")}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D81B60] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {t("myOrdersDesc")}
              </p>
            </div>
          </Link>

          {/* Saved Items */}
          <Link
            href="/savedItems"
            onClick={closeUserDropdown}
            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-rose-50/60 text-slate-700 hover:text-[#D81B60] transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-[#D81B60] text-slate-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs shrink-0">
              <Heart className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold group-hover:text-[#D81B60]">
                  {t("savedItems")}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D81B60] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {t("savedItemsDesc")}
              </p>
            </div>
          </Link>

          {/* Refer & Earn */}
          <Link
            href="/referral"
            onClick={closeUserDropdown}
            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-rose-50/60 text-slate-700 hover:text-[#D81B60] transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 group-hover:bg-[#D81B60] text-amber-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold group-hover:text-[#D81B60]">
                    {t("referEarn")}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D81B60] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {t("referEarnDesc")}
              </p>
            </div>
          </Link>

          {/* Account Settings */}
          <Link
            href="/accountSettings"
            onClick={closeUserDropdown}
            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-rose-50/60 text-slate-700 hover:text-[#D81B60] transition-all group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-[#D81B60] text-slate-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold group-hover:text-[#D81B60]">
                  {t("accountSettings")}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D81B60] group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {t("accountSettingsDesc")}
              </p>
            </div>
          </Link>

          {/* Download Mobile App (Highlighted Card) */}
          <a
            href={PLAYSTORE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeUserDropdown}
            className="flex items-center gap-3 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/20 border border-emerald-200/80 hover:border-emerald-300 hover:bg-emerald-100/50 transition-all group cursor-pointer shadow-xs my-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center transition-transform shadow-xs shrink-0 group-hover:scale-105">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                    Get Android App
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-200/80 uppercase tracking-wide">
                    Free
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
              <p className="text-[11px] text-emerald-700/90 font-medium truncate">
                Download on Google Play
              </p>
            </div>
          </a>

          {/* Store Navigation: Shop, Categories, Promotions (Mobile View) */}
          <div className="md:hidden border-t border-slate-100 pt-2 space-y-1">
            <div className="px-2 py-0.5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {t("exploreStore")}
              </p>
            </div>

            {/* Shop All Products */}
            <Link
              href="/product"
              onClick={closeUserDropdown}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-rose-50/60 text-slate-700 hover:text-[#D81B60] transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-50 group-hover:bg-[#D81B60] text-[#D81B60] group-hover:text-white flex items-center justify-center transition-colors shadow-xs shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold group-hover:text-[#D81B60]">
                    {t("shopAll")}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D81B60] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate">
                  {t("shopAllDesc")}
                </p>
              </div>
            </Link>

            {/* Categories */}
            <Link
              href="/categories"
              onClick={closeUserDropdown}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-rose-50/60 text-slate-700 hover:text-[#D81B60] transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 group-hover:bg-[#D81B60] text-purple-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold group-hover:text-[#D81B60]">
                    {t("categories")}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D81B60] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate">
                  {t("categoriesDesc")}
                </p>
              </div>
            </Link>

            {/* Promotions */}
            <Link
              href="/promotions"
              onClick={closeUserDropdown}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-rose-50/60 text-slate-700 hover:text-[#D81B60] transition-all group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 group-hover:bg-[#D81B60] text-amber-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold group-hover:text-[#D81B60]">
                      {t("promotions")}
                    </span>
                    <span className="bg-rose-100 text-[#D81B60] text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                      {t("hot")}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#D81B60] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate">
                  {t("promotionsDesc")}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Footer Logout Action */}
        <div className="p-2 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-100/60 transition-all cursor-pointer disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>
              {logoutMutation.isPending ? t("signingOut") : t("signOut")}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default UserDropdown;
