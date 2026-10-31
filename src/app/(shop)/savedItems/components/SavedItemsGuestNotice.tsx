"use client";

import React from "react";
import { Lock, LogIn } from "lucide-react";
import { useUIStore } from "@/state/ui.store";

export const SavedItemsGuestNotice: React.FC = () => {
  const { openLoginModal } = useUIStore();

  return (
    <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-md mb-6 border border-rose-900/50 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-extrabold border border-rose-500/30">
            <Lock className="w-3 h-3" />
            <span>Sign In Required for Wishlist Sync</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            Sync Saved Items Across Your Devices
          </h2>
          <p className="text-xs text-slate-300 max-w-xl font-normal">
            Sign in or create an account to save products to your cloud wishlist, receive price drop alerts, and easily access your saved items anywhere.
          </p>
        </div>

        <button
          onClick={openLoginModal}
          className="flex items-center justify-center gap-2 px-5 h-10 rounded-xl bg-[#D81B60] hover:bg-rose-500 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer shrink-0 w-full sm:w-auto"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In / Register</span>
        </button>
      </div>
    </div>
  );
};
