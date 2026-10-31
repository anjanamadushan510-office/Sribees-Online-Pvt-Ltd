"use client";

import React from "react";
import { DollarSign, Users, Clock, CheckCircle2, ArrowDownToLine } from "lucide-react";
import { ReferralMeResponse } from "@/interfaces/referral.interface";
import { formatCurrency } from "@/utils/formatCurrency";
import { useClaimReferralCommission } from "@/api/queries/useReferral";
import { useToastStore } from "@/state/toast.store";

interface ReferralStatsCardProps {
  data: ReferralMeResponse;
}

export const ReferralStatsCard: React.FC<ReferralStatsCardProps> = ({ data }) => {
  const { totals, friendCount, commissionPercent, currency } = data;
  const claimMutation = useClaimReferralCommission();
  const addToast = useToastStore((state) => state.addToast);

  const handleClaim = async () => {
    if (totals.claimable <= 0) return;
    try {
      const res = await claimMutation.mutateAsync();
      addToast({
        title: "Commission Claimed!",
        message:
          res.message ||
          `Successfully claimed ${formatCurrency(res.data?.amount ?? totals.claimable, currency)} to your wallet.`,
        type: "success",
      });
    } catch (err: any) {
      addToast({
        title: "Claim Failed",
        message:
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "Could not transfer commission to wallet.",
        type: "error",
      });
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Claimable Earnings */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            {totals.claimable > 0 && (
              <button
                onClick={handleClaim}
                disabled={claimMutation.isPending}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>{claimMutation.isPending ? "Claiming..." : "Claim"}</span>
              </button>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Claimable Earnings
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {formatCurrency(totals.claimable, currency)}
            </h3>
          </div>
        </div>
      </div>

      {/* 2. Friends Joined */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
        <div className="relative z-10 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-[#D81B60] flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Friends Joined
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {friendCount}
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                {friendCount === 1 ? "Friend" : "Friends"}
              </span>
            </div>
            {commissionPercent > 0 && (
              <p className="text-[11px] font-semibold text-[#D81B60] mt-0.5">
                {commissionPercent}% per order
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Pending Commission */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
        <div className="relative z-10 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Commission
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {formatCurrency(totals.pending, currency)}
            </h3>
          </div>
        </div>
      </div>

      {/* 4. Total Paid / Paid Out */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
        <div className="relative z-10 space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Paid Out
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {formatCurrency(totals.paid, currency)}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};
