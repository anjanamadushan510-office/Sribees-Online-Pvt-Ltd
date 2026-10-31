"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  ShoppingBag,
  Bell,
  ChevronDown,
  User,
  X,
} from "lucide-react";
import { useCartStore } from "@/state/cart.store";
import { useUIStore } from "@/state/ui.store";
import { useNotificationStore } from "@/state/notification.store";
import { useGetUnreadNotificationCount } from "@/api/queries/useNotifications";
import { useGetCart } from "@/api/queries/useCart";
import { formatLKR } from "@/utils/formatCurrency";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { UserDropdown } from "@/components/UserDropdown";
import { SearchBar } from "@/components/SearchBar";
import { useAuthStore } from "@/state/auth.store";
import { ROUTES } from "@/constants/routes";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/Avatar";

export const MainNavbar: React.FC = () => {
  const t = useTranslations("common");
  const { toggleCart, getTotalPrice, getTotalItems } = useCartStore();
  const { data: serverCart } = useGetCart();
  const { openDropdown, closeDropdown, toggleDropdown } = useNotificationStore();
  const { data: unreadCountData } = useGetUnreadNotificationCount();
  const {
    selectedLocation,
    setSelectedLocation,
    setIsLocationModalOpen,
    searchQuery,
    setSearchQuery,
    openLoginModal,
    isLoggedIn,
    userProfile,
    openUserDropdown,
    closeUserDropdown,
    toggleUserDropdown,
  } = useUIStore();

  const { user, isAuthenticated } = useAuthStore();
  const isUserLoggedIn = isAuthenticated || (isLoggedIn && !!userProfile);
  const displayName = user?.fullName || userProfile?.name || "Account";
  const [localAvatar, setLocalAvatar] = useState<string>("");

  useEffect(() => {
    const loadAvatar = () => {
      const saved = localStorage.getItem("sribees_local_avatar");
      setLocalAvatar(saved || "");
    };

    loadAvatar();
    window.addEventListener("sribees_avatar_updated", loadAvatar);
    return () => {
      window.removeEventListener("sribees_avatar_updated", loadAvatar);
    };
  }, []);

  const avatarUrl = user?.profilePictureUrl || userProfile?.avatarUrl || localAvatar || "";

  const isServerCart = isUserLoggedIn && Boolean(serverCart);
  const totalItemsCount = isServerCart
    ? (serverCart?.items || []).reduce((acc, item) => acc + item.quantity, 0)
    : getTotalItems();
  const cartTotalPrice = isServerCart
    ? serverCart?.totals?.subtotal ?? 0
    : getTotalPrice();

  const unreadCount = unreadCountData ?? 0;
  const mouseLeaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userMouseLeaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    if (mouseLeaveTimerRef.current) {
      clearTimeout(mouseLeaveTimerRef.current);
      mouseLeaveTimerRef.current = null;
    }
    closeUserDropdown();
    openDropdown();
  };

  const handleMouseLeave = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    mouseLeaveTimerRef.current = setTimeout(() => {
      closeDropdown();
    }, 250);
  };

  const handleUserMouseEnter = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    if (userMouseLeaveTimerRef.current) {
      clearTimeout(userMouseLeaveTimerRef.current);
      userMouseLeaveTimerRef.current = null;
    }
    closeDropdown();
    openUserDropdown();
  };

  const handleUserMouseLeave = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    userMouseLeaveTimerRef.current = setTimeout(() => {
      closeUserDropdown();
    }, 250);
  };

  return (
    <>
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-xs">
        <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
            <Link href={ROUTES.HOME} className="flex items-end gap-2.5 group">
              <img
                src="/base/logo.png"
                alt="SRIBEES logo"
                className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="font-montserrat text-2xl font-black italic tracking-tight text-[#D81B60]">
                  SRIBEƎS
                </span>
                <span className="font-poppins text-base font-bold not-italic text-[#D81B60] tracking-tight">
                  Online
                </span>
              </div>
            </Link>

            {/* Location Selector (Desktop) */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-rose-50/50 hover:border-rose-200 transition-all text-xs font-semibold text-slate-700 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#D81B60]" />
              <span>{selectedLocation}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-2">
            <SearchBar variant="desktop" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Notification Bell Dropdown Trigger */}
            <div
              className="relative block"
              data-dropdown-trigger="notification"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeUserDropdown();
                  toggleDropdown();
                }}
                title="Notifications"
                className="flex items-center gap-1.5 p-2 text-slate-600 hover:text-[#D81B60] hover:bg-rose-50 rounded-full transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#D81B60] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Floating Notification Popover Menu */}
              <NotificationDropdown />
            </div>

            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 bg-[#D81B60] hover:bg-[#C2185B] text-white rounded-full shadow-md shadow-rose-200 transition-all transform active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-bold tracking-wide">
                {formatLKR(cartTotalPrice)} ({totalItemsCount})
              </span>
              <span className="sm:hidden text-xs font-bold tracking-wide">
                {totalItemsCount}
              </span>
            </button>

            {/* User Profile / Login Register Button */}
            {isUserLoggedIn ? (
              <div
                className="relative block"
                data-dropdown-trigger="user"
                onMouseEnter={handleUserMouseEnter}
                onMouseLeave={handleUserMouseLeave}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeDropdown();
                    toggleUserDropdown();
                  }}
                  title={displayName}
                  className="flex items-center gap-2 p-1 sm:pl-1.5 sm:pr-3 sm:py-1 text-slate-700 hover:text-[#D81B60] hover:bg-rose-50/70 rounded-full transition-all cursor-pointer font-bold text-xs"
                >
                  <Avatar
                    src={avatarUrl}
                    name={displayName}
                    size="xs"
                  />
                  <span className="hidden md:inline text-slate-800 font-extrabold max-w-30 truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                </button>

                {/* Floating User Profile Dropdown */}
                <UserDropdown />
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                title={t("navbar.loginRegister")}
                className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-slate-700 hover:text-[#D81B60] hover:bg-rose-50 rounded-full border border-slate-200 transition-all cursor-pointer font-bold text-xs"
              >
                <User className="w-4 h-4 text-[#D81B60]" />
                <span className="hidden md:inline text-slate-700 hover:text-[#D81B60]">
                  {t("navbar.loginRegister")}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search & Location Sub-Bar */}
        <div className="md:hidden border-t border-slate-100 bg-white px-3.5 py-2">
          <div className="flex items-center justify-between gap-2">
            {/* Left: Search Bar */}
            <div className="relative flex-1 min-w-0">
              <SearchBar variant="mobile" />
            </div>

            {/* Right: Location Selector */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-200/90 bg-rose-50/70 hover:bg-rose-100/80 active:scale-95 transition-all text-xs font-bold text-slate-700 cursor-pointer max-w-[48%]"
              title="Change Delivery Location"
            >
              <MapPin className="w-3.5 h-3.5 text-[#D81B60] shrink-0" />
              <span className="truncate text-xs font-bold text-slate-800">
                {selectedLocation || t("navbar.selectHub")}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default MainNavbar;
