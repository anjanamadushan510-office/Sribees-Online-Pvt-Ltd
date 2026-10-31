"use client";

import React, { useState } from "react";
import { Laptop, Smartphone, LogOut, Loader2 } from "lucide-react";
import { UserSession, ApiSessionItem } from "@/interfaces/accountSettings.interface";
import { useToastStore } from "@/state/toast.store";
import { useGetSessions, useDeleteSession, useLogoutOthers } from "@/api/queries/useAuth";
import { LogoutSessionsModal } from "./LogoutSessionsModal";
import { formatRelativeTime } from "@/utils/formatDate";
import { useTranslations } from "next-intl";

export const ActiveSessionsCard: React.FC = () => {
  const t = useTranslations("account");
  const { data: rawSessions, isLoading } = useGetSessions();
  const deleteSessionMutation = useDeleteSession();
  const logoutOthersMutation = useLogoutOthers();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const sessions: UserSession[] = Array.isArray(rawSessions) && rawSessions.length > 0
    ? rawSessions.map((item: ApiSessionItem, idx: number) => {
        const id = item.sessionId || item.session_id || item.id || `session-${idx}`;
        const deviceName = item.device || item.deviceName || item.device_name || item.userAgent || "Web Device";
        const ipAddress = item.ipAddress || item.ip_address || "IP Address";
        const isCurrentDevice = Boolean(item.isCurrent ?? item.is_current ?? idx === 0);
        const rawTime = item.lastActive || item.last_active || item.createdAt || item.created_at;
        const lastActive = isCurrentDevice
          ? t("settings.activeNow")
          : rawTime
          ? t("settings.lastActive", { time: formatRelativeTime(rawTime) })
          : t("settings.recentlyActive");
        const isMobile =
          deviceName.toLowerCase().includes("iphone") ||
          deviceName.toLowerCase().includes("android") ||
          deviceName.toLowerCase().includes("mobile") ||
          (item.userAgent || "").toLowerCase().includes("mobile");

        return {
          id,
          deviceName,
          location: "Sri Lanka",
          ipAddress,
          lastActive,
          isCurrentDevice,
          deviceType: isMobile ? "mobile" : "desktop",
        };
      })
    : [];

  const handleRevokeSingle = (sessionId: string, deviceName: string) => {
    deleteSessionMutation.mutate(sessionId, {
      onSuccess: () => {
        addToast({
          title: t("settings.sessionTerminatedTitle"),
          message: t("settings.sessionTerminatedMsg", { deviceName }),
          type: "info",
        });
      },
      onError: () => {
        addToast({
          title: t("settings.title"),
          message: t("settings.sessionTerminateError", { deviceName }),
          type: "error",
        });
      },
    });
  };

  const handleLogoutAllOther = () => {
    logoutOthersMutation.mutate(undefined, {
      onSuccess: () => {
        setIsLogoutModalOpen(false);
        addToast({
          title: t("settings.sessionsRevokedTitle"),
          message: t("settings.sessionsRevokedMsg"),
          type: "success",
        });
      },
      onError: () => {
        setIsLogoutModalOpen(false);
        addToast({
          title: t("settings.title"),
          message: t("settings.sessionsRevokeError"),
          type: "error",
        });
      },
    });
  };

  const otherSessionsCount = sessions.filter((s) => !s.isCurrentDevice).length;

  return (
    <>
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
        <div>
          {/* Card Header */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {t("settings.sessionsTitle")}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {t("settings.sessionsDesc")}
                </p>
              </div>
            </div>
            <div className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-200 shrink-0">
              {t("settings.sessionsActiveBadge", { count: sessions.length })}
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex flex-col gap-3 my-4 max-h-64 overflow-y-auto pr-1.5 overscroll-contain">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-3 transition-all hover:bg-slate-100/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    {session.deviceType === "mobile" ? (
                      <Smartphone className="w-4 h-4 text-slate-600" />
                    ) : (
                      <Laptop className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {session.deviceName}
                      </span>
                      {session.isCurrentDevice && (
                        <span className="bg-emerald-100 text-emerald-800 text-3xs font-extrabold px-2 py-0.5 rounded-full shrink-0">
                          {t("settings.thisDevice")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      {session.location} • {session.isCurrentDevice ? `IP: ${session.ipAddress}` : session.lastActive}
                    </p>
                  </div>
                </div>

                {/* Right Action / Status */}
                <div className="shrink-0">
                  {session.isCurrentDevice ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Active session" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRevokeSingle(session.id, session.deviceName)}
                      title="Logout from device"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {sessions.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">
                {t("settings.noSessions")}
              </div>
            )}
          </div>
        </div>

        {/* Action Button: Log Out of All Other Devices */}
        {otherSessionsCount > 0 && (
          <div className="mt-4 pt-2">
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full bg-rose-50/80 hover:bg-rose-100/90 text-[#D81B60] border border-rose-200/90 font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-99"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("settings.logoutOtherDevices")}</span>
            </button>
          </div>
        )}
      </div>

      {/* Logout Sessions Confirmation Modal */}
      <LogoutSessionsModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutAllOther}
        sessionCount={otherSessionsCount}
        isPending={logoutOthersMutation.isPending}
      />
    </>
  );
};
