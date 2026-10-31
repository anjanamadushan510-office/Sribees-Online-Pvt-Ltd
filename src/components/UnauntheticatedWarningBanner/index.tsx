"use client";

import React from "react";
import { useAuthStore } from "@/state/auth.store";
import { useGetMe } from "@/api/queries/useAuth";
import { useUIStore } from "@/state/ui.store";

interface UnauntheticatedWarningBannerProps {
  className?: string;
  title?: string;
  message?: string;
  buttonText?: string;
}

export const UnauntheticatedWarningBanner: React.FC<
  UnauntheticatedWarningBannerProps
> = ({
  className = "",
  title = "Viewing Account in Guest Mode",
  message = "Sign in with your mobile number to view your actual account details, orders, and saved addresses.",
  buttonText = "Sign In / Register Now",
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { data: meUser } = useGetMe();
  const { openLoginModal } = useUIStore();

  const currentUser = meUser || user;

  if (isAuthenticated || currentUser) {
    return null;
  }

  return (
    <div
      className={`mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs ${className}`}
    >
      <div className="text-center sm:text-left">
        <h3 className="text-sm font-bold text-amber-900">{title}</h3>
        <p className="text-xs text-amber-700 mt-0.5">{message}</p>
      </div>
      <button
        type="button"
        onClick={openLoginModal}
        className="px-5 py-2.5 bg-[#D81B60] hover:bg-[#C2185B] text-white text-xs font-bold rounded-xl shadow-md shadow-rose-200 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 cursor-pointer"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default UnauntheticatedWarningBanner;
