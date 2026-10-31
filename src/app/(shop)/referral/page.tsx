"use client";

import React, { useMemo } from "react";
import { ReferralHeader } from "./components/ReferralHeader";
import { ReferralStatsCard } from "./components/ReferralStatsCard";
import { ReferralCodeBox } from "./components/ReferralCodeBox";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { ApplyReferralSection } from "./components/ApplyReferralSection";
import { ReferralHistoryTable } from "./components/ReferralHistoryTable";
import { UnauntheticatedWarningBanner } from "@/components/UnauntheticatedWarningBanner";
import { useGetReferralMe } from "@/api/queries/useReferral";
import { useAuthStore } from "@/state/auth.store";
import { useUIStore } from "@/state/ui.store";
import { LogIn, Gift, AlertCircle, RefreshCw } from "lucide-react";

export default function ReferralPage() {
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const {
    data: referralData,
    isLoading,
    isError,
    refetch,
  } = useGetReferralMe();

  const referralLink = useMemo(() => {
    if (!referralData?.referralCode) return "";
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://sribees.online";
    return `${origin}?ref=${referralData.referralCode}`;
  }, [referralData?.referralCode]);

  return (
    <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <UnauntheticatedWarningBanner />

      {/* Header Banner */}
      <ReferralHeader />

      {!isAuthenticated ? (
        /* Unauthenticated Call-to-action */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-[#D81B60] flex items-center justify-center mx-auto shadow-sm">
            <Gift className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Sign In to Access Your Referral Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Log in to view your unique referral code, track your invited
              friends, and claim commissions directly into your Sribees Wallet.
            </p>
          </div>
          <button
            onClick={() => openLoginModal()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#D81B60] text-white text-sm font-extrabold shadow-md hover:bg-rose-700 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In or Create Account</span>
          </button>
        </div>
      ) : isLoading ? (
        /* Loading Skeleton */
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-100 rounded-3xl" />
            ))}
          </div>
          <div className="h-44 bg-slate-100 rounded-3xl" />
          <div className="h-36 bg-slate-100 rounded-3xl" />
          <div className="h-56 bg-slate-100 rounded-3xl" />
        </div>
      ) : isError ? (
        /* Error State */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-[#D81B60] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">
              Failed to Load Referral Details
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We encountered an issue fetching your referral program
              information. Please check your connection and try again.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : referralData ? (
        /* Live Backend Data Presentation */
        <>
          {/* Stats Counters & Claim Commission */}
          <ReferralStatsCard data={referralData} />

          {/* Referral Code & Social Share Box */}
          <ReferralCodeBox
            referralCode={referralData.referralCode}
            referralLink={referralLink}
          />

          {/* Redeem An Invite Code Section */}
          {/* <ApplyReferralSection /> */}

          {/* Real Referred Friends Activity Table */}
          <ReferralHistoryTable
            friends={referralData.friends}
            currency={referralData.currency}
          />
        </>
      ) : null}

      {/* How it Works Step-by-Step */}
      <HowItWorksSection />
    </main>
  );
}
