"use client";

import React, { useState, useEffect } from "react";
import { X, AlertOctagon, Trash2, Loader2, Send } from "lucide-react";
import { useToastStore } from "@/state/toast.store";
import { useAuthStore } from "@/state/auth.store";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  useRequestAccountDeletionOtp,
  useConfirmAccountDeletion,
} from "@/api/queries/useAuth";
import { useTranslations } from "next-intl";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalanceFormatted: string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  walletBalanceFormatted,
}) => {
  const t = useTranslations("account");
  const [confirmInput, setConfirmInput] = useState("");
  const [otpStep, setOtpStep] = useState<"confirm_text" | "enter_otp">("confirm_text");
  const [otpCode, setOtpCode] = useState("");
  const [reason, setReason] = useState("");
  const [otpSentMessage, setOtpSentMessage] = useState("");

  const addToast = useToastStore((state) => state.addToast);
  const logout = useAuthStore((state) => state.logout);

  const requestOtpMutation = useRequestAccountDeletionOtp();
  const confirmDeletionMutation = useConfirmAccountDeletion();

  useBodyScrollLock(isOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      setConfirmInput("");
      setOtpStep("confirm_text");
      setOtpCode("");
      setReason("");
      setOtpSentMessage("");
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isTextConfirmed = confirmInput.trim().toUpperCase() === "DELETE";

  const handleRequestOtp = () => {
    if (!isTextConfirmed) return;
    requestOtpMutation.mutate(undefined, {
      onSuccess: (res) => {
        setOtpStep("enter_otp");
        setOtpSentMessage(res.message || t("settings.otpSentDefaultMsg"));
        addToast({
          title: t("settings.otpSentTitle"),
          message: res.message || t("settings.otpSentDefaultMsg"),
          type: "info",
        });
      },
      onError: (err: any) => {
        addToast({
          title: t("settings.otpRequestFailedTitle"),
          message:
            err?.response?.data?.error?.message ||
            err?.message ||
            t("settings.otpRequestFailedDefault"),
          type: "error",
        });
      },
    });
  };

  const handleFinalDelete = () => {
    if (!otpCode.trim()) return;
    confirmDeletionMutation.mutate(
      { code: otpCode.trim(), reason: reason.trim() || undefined },
      {
        onSuccess: (res) => {
          onClose();
          logout();
          addToast({
            title: t("settings.accountDeletedTitle"),
            message: res.message || t("settings.accountDeletedDefaultMsg"),
            type: "info",
          });
          window.location.href = "/";
        },
        onError: (err: any) => {
          addToast({
            title: t("settings.deletionFailedTitle"),
            message:
              err?.response?.data?.error?.message ||
              err?.message ||
              t("settings.deletionFailedDefaultMsg"),
            type: "error",
          });
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={requestOtpMutation.isPending || confirmDeletionMutation.isPending}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <AlertOctagon className="w-6 h-6" />
        </div>

        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
          {t("settings.deleteModalTitle")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-medium">
          {t("settings.deleteModalSubtitle")}
        </p>

        <ul className="mt-3 space-y-1.5 text-xs text-slate-600 font-medium pl-2">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {t("settings.deleteWalletLoss", { walletBalanceFormatted })}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {t("settings.deleteAddressesLoss")}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {t("settings.deleteHistoryLoss")}
          </li>
        </ul>

        {otpStep === "confirm_text" ? (
          <div className="mt-5">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t("settings.deleteTypePrompt")}
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={t("settings.deleteTypePlaceholder")}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm font-semibold outline-hidden transition-all"
            />
          </div>
        ) : (
          <div className="mt-5 space-y-3.5">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              {otpSentMessage || t("settings.deleteOtpSentMsg")}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t("settings.deleteOtpInputLabel")}
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm font-bold tracking-widest outline-hidden transition-all text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t("settings.deleteReasonLabel")}
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t("settings.deleteReasonPlaceholder")}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-slate-400 text-xs outline-hidden"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={requestOtpMutation.isPending || confirmDeletionMutation.isPending}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            {t("settings.cancel")}
          </button>

          {otpStep === "confirm_text" ? (
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={!isTextConfirmed || requestOtpMutation.isPending}
              className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm ${
                isTextConfirmed && !requestOtpMutation.isPending
                  ? "bg-[#B71C1C] hover:bg-[#991B1B] cursor-pointer"
                  : "bg-slate-300 cursor-not-allowed opacity-70"
              }`}
            >
              {requestOtpMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("settings.requestingOtp")}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{t("settings.sendOtpBtn")}</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalDelete}
              disabled={!otpCode.trim() || confirmDeletionMutation.isPending}
              className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm ${
                otpCode.trim() && !confirmDeletionMutation.isPending
                  ? "bg-[#B71C1C] hover:bg-[#991B1B] cursor-pointer"
                  : "bg-slate-300 cursor-not-allowed opacity-70"
              }`}
            >
              {confirmDeletionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("settings.deletingAccount")}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{t("settings.confirmDeleteBtn")}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
