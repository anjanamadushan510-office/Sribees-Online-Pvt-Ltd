"use client";

import React, { useState } from "react";
import { Tag, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRedeemReferral } from "@/api/queries/useReferral";
import { useToastStore } from "@/state/toast.store";
import { isValidReferralCode } from "@/utils/urlSecurity";

export const ApplyReferralSection: React.FC = () => {
  const [code, setCode] = useState("");
  const redeemMutation = useRedeemReferral();
  const addToast = useToastStore((state) => state.addToast);
  const [appliedSuccess, setAppliedSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    if (!isValidReferralCode(cleanCode)) {
      addToast({
        title: "Invalid Code",
        message: "Referral code must be 3-30 alphanumeric characters.",
        type: "error",
      });
      return;
    }

    try {
      const res = await redeemMutation.mutateAsync({
        referral_code: cleanCode,
      });

      const message =
        res.message || "Referral code redeemed successfully! You are now connected to your inviter.";
      setAppliedSuccess(message);
      addToast({
        title: "Code Redeemed!",
        message,
        type: "success",
      });
      setCode("");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Could not redeem referral code. It may already be attached or invalid.";
      addToast({
        title: "Redeem Failed",
        message: errorMsg,
        type: "error",
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-rose-950 text-white rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-md">
          <div className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5" />
            <span>Have an Invite Code?</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Connect With Your Inviter
          </h2>
          <p className="text-xs text-slate-300">
            Were you invited by a friend? Enter their referral code below to link your account and activate your benefits.
          </p>
        </div>

        {appliedSuccess ? (
          <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-2xl p-4 flex items-center gap-3 text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold">{appliedSuccess}</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 w-full md:w-auto"
          >
            <input
              type="text"
              placeholder="ENTER REFERRAL CODE"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={redeemMutation.isPending}
              className="bg-transparent px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase text-white placeholder-slate-400 focus:outline-hidden flex-1 md:w-56"
            />
            <button
              type="submit"
              disabled={redeemMutation.isPending || !code.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold hover:from-rose-600 hover:to-pink-600 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <span>{redeemMutation.isPending ? "Redeeming..." : "Redeem"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
