"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  Truck,
  Tag,
  PackageCheck,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Clock,
  Loader2,
  LogIn,
} from "lucide-react";
import { useNotificationStore } from "@/state/notification.store";
import { useAuthStore } from "@/state/auth.store";
import { useUIStore } from "@/state/ui.store";
import {
  useGetNotifications,
  useGetUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from "@/api/queries/useNotifications";
import { Notification, NotificationType } from "@/interfaces/notification.interface";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface NotificationDropdownProps {
  showMobileSubHeader?: boolean;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  showMobileSubHeader = true,
}) => {
  const {
    isDropdownOpen,
    closeDropdown,
    activeTab,
    setActiveTab,
    selectedNotification,
    setSelectedNotification,
  } = useNotificationStore();

  useBodyScrollLock(isDropdownOpen);

  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useUIStore();

  // TanStack Query Hooks for notifications
  const { data: notifData, isLoading, isError, refetch } = useGetNotifications();
  const { data: unreadCountData } = useGetUnreadNotificationCount();
  const markAsReadMutation = useMarkNotificationRead();
  const markAllAsReadMutation = useMarkAllNotificationsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const deleteAllNotificationsMutation = useDeleteAllNotifications();

  const notifications = notifData?.notifications || [];
  const unreadCount = unreadCountData ?? 0;

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle Outside Click & Touch to Close Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !(target as HTMLElement)?.closest?.('[data-dropdown-trigger="notification"]')
      ) {
        closeDropdown();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, { passive: true });
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isDropdownOpen, closeDropdown]);

  if (!isDropdownOpen) return null;

  const mobileTopClass = showMobileSubHeader ? "top-[112px]" : "top-[64px]";

  // Filter notifications by active tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    return n.type === activeTab;
  });

  const handleSelectNotification = (notif: Notification) => {
    setSelectedNotification(notif);
    if (!notif.read) {
      markAsReadMutation.mutate(notif.id);
    }
  };

  const handleCopyCode = (id: string, code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "delivery":
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <Truck className="w-4 h-4" />
          </div>
        );
      case "promo":
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-100/80 text-[#D81B60] flex items-center justify-center shrink-0 shadow-xs">
            <Tag className="w-4 h-4" />
          </div>
        );
      case "order":
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
            <PackageCheck className="w-4 h-4" />
          </div>
        );
      case "system":
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldAlert className="w-4 h-4" />
          </div>
        );
    }
  };

  const filterTabs: { key: NotificationType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "delivery", label: "Delivery" },
    { key: "promo", label: "Offers" },
    { key: "order", label: "Orders" },
    { key: "system", label: "System" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 sm:hidden"
        onClick={closeDropdown}
      />

      <div
        ref={dropdownRef}
        className={`fixed left-3 right-3 ${mobileTopClass} sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[410px] max-h-[85vh] sm:max-h-none bg-white rounded-3xl shadow-2xl shadow-slate-300/60 border border-slate-100 z-50 overflow-hidden transform transition-all animate-fadeInDown`}
      >
        {/* Top Pointer Arrow */}
        <div className="hidden sm:block absolute -top-2 right-5 w-4 h-4 bg-white border-t border-l border-slate-100 rotate-45 z-10" />

        {/* Dropdown Header */}
        <div className="relative z-20 px-4 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 via-white to-rose-50/40 flex items-center justify-between">
          {selectedNotification ? (
            <button
              onClick={() => setSelectedNotification(null)}
              className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-[#D81B60] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Notifications</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-50 text-[#D81B60]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 leading-none">
                    Notifications
                  </h3>
                  {isAuthenticated && unreadCount > 0 && (
                    <span className="bg-rose-100 text-[#D81B60] text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Header Buttons */}
          <div className="flex items-center gap-1">
            {isAuthenticated && !selectedNotification && notifications.length > 0 && (
              <>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                    title="Mark all as read"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold disabled:opacity-50"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[10px]">Read all</span>
                  </button>
                )}
                <button
                  onClick={() => deleteAllNotificationsMutation.mutate()}
                  disabled={deleteAllNotificationsMutation.isPending}
                  title="Clear all"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              onClick={closeDropdown}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close notifications"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        {isAuthenticated && !selectedNotification && (
          <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
            {filterTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const count =
                tab.key === "all"
                  ? notifications.length
                  : notifications.filter((n) => n.type === tab.key).length;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-[#D81B60] text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span
                      className={`text-[9px] px-1.2 py-0.1 rounded-full font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Dropdown Content Area */}
        <div className="max-h-[60vh] sm:max-h-[380px] overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-200">
          {!isAuthenticated ? (
            /* Guest / Unauthenticated State */
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-[#D81B60] flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800">
                  Sign in to view notifications
                </h4>
                <p className="text-[11px] text-slate-400 max-w-[230px]">
                  Get real-time updates on your orders, special promos, and account alerts.
                </p>
              </div>
              <button
                onClick={() => {
                  closeDropdown();
                  openLoginModal();
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#D81B60] hover:bg-[#C2185B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            </div>
          ) : isLoading ? (
            /* Loading State */
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#D81B60]" />
              <p className="text-xs font-medium">Loading notifications...</p>
            </div>
          ) : isError ? (
            /* Error State */
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                Failed to load notifications
              </p>
              <button
                onClick={() => refetch()}
                className="text-xs text-[#D81B60] font-bold hover:underline cursor-pointer"
              >
                Try again
              </button>
            </div>
          ) : selectedNotification ? (
            /* Detailed View Screen */
            <div className="space-y-3 p-1 animate-fadeIn">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                {getTypeIcon(selectedNotification.type)}
                <div className="flex-1">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                    {selectedNotification.type} Notification
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {selectedNotification.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {selectedNotification.timestamp}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed space-y-2.5">
                <p>{selectedNotification.message}</p>

                {selectedNotification.discountBadge && (
                  <div className="inline-flex items-center gap-1 bg-rose-50 text-[#D81B60] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-rose-100">
                    <Sparkles className="w-3 h-3" />
                    <span>Offer: {selectedNotification.discountBadge}</span>
                  </div>
                )}

                {selectedNotification.promoCode && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-dashed border-rose-300 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-slate-500 font-semibold uppercase">
                        Promo Code
                      </p>
                      <p className="text-xs font-black text-[#D81B60] tracking-widest font-mono">
                        {selectedNotification.promoCode}
                      </p>
                    </div>
                    <button
                      onClick={(e) =>
                        handleCopyCode(
                          selectedNotification.id,
                          selectedNotification.promoCode!,
                          e
                        )
                      }
                      className="flex items-center gap-1 px-2.5 py-1 bg-[#D81B60] text-white hover:bg-[#C2185B] text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedId === selectedNotification.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {selectedNotification.actionLabel && (
                <a
                  href={selectedNotification.actionUrl || "#"}
                  onClick={() => closeDropdown()}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#D81B60] hover:bg-[#C2185B] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <span>{selectedNotification.actionLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : filteredNotifications.length === 0 ? (
            /* Empty State */
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <BellOff className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-700">
                No notifications here
              </h4>
              <p className="text-[11px] text-slate-400 max-w-[220px]">
                You're all caught up! Check back later for instant updates.
              </p>
            </div>
          ) : (
            /* Notifications List Items */
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleSelectNotification(notif)}
                className={`group relative p-2.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  !notif.read
                    ? "bg-rose-50/50 border-rose-200/80 hover:bg-rose-50/80"
                    : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/80"
                }`}
              >
                {getTypeIcon(notif.type)}

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between gap-1.5">
                    <h4
                      className={`text-xs font-extrabold truncate ${
                        !notif.read ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-[9px] font-semibold text-slate-400 shrink-0">
                      {notif.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                    {notif.message}
                  </p>

                  {/* Promo Code Copy Pill */}
                  {notif.promoCode && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-rose-100 text-[#D81B60] text-[9px] font-mono font-bold rounded border border-rose-200">
                        {notif.promoCode}
                      </span>
                      <button
                        onClick={(e) => handleCopyCode(notif.id, notif.promoCode!, e)}
                        className="text-[9px] font-bold text-[#D81B60] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        {copiedId === notif.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Order tracking badge */}
                  {notif.orderId && !notif.promoCode && (
                    <div className="mt-1 inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                      <span>Order #{notif.orderId}</span>
                      <ChevronRight className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                {/* Unread Rose Dot */}
                {!notif.read && (
                  <span className="absolute top-3 right-2.5 w-2 h-2 rounded-full bg-[#D81B60] ring-2 ring-white" />
                )}

                {/* Delete Icon on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotificationMutation.mutate(notif.id);
                  }}
                  title="Delete"
                  className="absolute bottom-2 right-2 p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Info Bar */}
        {isAuthenticated && !selectedNotification && notifications.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>
              {filteredNotifications.length} of {notifications.length} notifications
            </span>
            {unreadCount === 0 && (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCheck className="w-3 h-3" /> All caught up!
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDropdown;
