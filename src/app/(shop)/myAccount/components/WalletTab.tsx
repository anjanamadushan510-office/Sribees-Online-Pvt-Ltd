"use client";

import React, { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Wallet, Loader2 } from "lucide-react";
import { WalletInfo } from "@/interfaces/account.interface";
import { formatLKR } from "@/utils/formatCurrency";
import { useGetWalletBalance, useGetWalletTransactions } from "@/api/queries/useWallet";
import { WalletTransactionItem } from "@/interfaces/wallet.interface";
import { Header } from "@/components/Header";
import { useTranslations } from "next-intl";

interface WalletTabProps {
  wallet: WalletInfo;
}

type FilterType = "all" | "added" | "spent";

export const WalletTab: React.FC<WalletTabProps> = ({ wallet }) => {
  const t = useTranslations("account.wallet");
  const [filter, setFilter] = useState<FilterType>("all");
  const { data: balanceData } = useGetWalletBalance();
  const { data: txData, isLoading } = useGetWalletTransactions();

  const currentBalance = balanceData?.balance ?? wallet.balance;
  const rawTransactions: WalletTransactionItem[] = txData?.transactions || [];

  const transactions = rawTransactions.map((tx) => ({
    id: tx.transaction_id,
    title: tx.title || (tx.type === "earned" ? t("cashBackCredit") : t("walletPayment")),
    date: tx.created_at
      ? new Date(tx.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : "Recent",
    amount: tx.type === "spent" ? -Math.abs(tx.amount) : Math.abs(tx.amount),
    type: tx.type === "spent" ? "debit" : "credit",
    tag: tx.type === "earned" ? t("cashBackAddedTag") : tx.type === "refund" ? t("refundAddedTag") : t("walletPayment"),
  }));

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "added") return tx.type === "credit";
    if (filter === "spent") return tx.type === "debit";
    return true;
  });

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      {/* Header */}
      <Header
        headingTag="h2"
        size="md"
        title={
          <span className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#D81B60]" />
            {t("title")}
          </span>
        }
        description={t("description")}
        borderBottom
        actions={
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <div className="bg-rose-50 border border-rose-200/80 rounded-2xl px-4 py-2 flex items-center gap-3">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {t("availableCashback")}
                </p>
                <p className="text-base font-black text-[#D81B60]">
                  {formatLKR(currentBalance)}
                </p>
              </div>
            </div>
            {typeof (balanceData?.pending_cashback ?? wallet.pendingCashback) === "number" && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl px-4 py-2 flex items-center gap-3">
                <div>
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    {t("pendingCashback")}
                  </p>
                  <p className="text-base font-black text-amber-700">
                    {formatLKR(balanceData?.pending_cashback ?? wallet.pendingCashback ?? 0)}
                  </p>
                </div>
              </div>
            )}
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t("allActivity")}
          </button>
          <button
            onClick={() => setFilter("added")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === "added"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t("cashBackAdded")}
          </button>
          <button
            onClick={() => setFilter("spent")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === "spent"
                ? "bg-white text-rose-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t("walletPayments")}
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 bg-white hover:bg-slate-50/60 transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === "credit"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                      : "bg-rose-50 text-rose-600 border border-rose-200/60"
                  }`}
                >
                  {tx.type === "credit" ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {tx.title}
                    </p>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        tx.type === "credit"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {tx.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {tx.date}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-xs sm:text-sm font-black ${
                    tx.type === "credit" ? "text-emerald-600" : "text-slate-900"
                  }`}
                >
                  {tx.type === "credit" ? "+" : ""}
                  {formatLKR(Math.abs(tx.amount))}
                </span>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">
                  {tx.type === "credit" ? t("credited") : t("debited")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
