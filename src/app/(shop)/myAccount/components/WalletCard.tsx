import React from "react";
import { Wallet } from "lucide-react";
import { WalletInfo } from "@/interfaces/account.interface";
import { formatLKR } from "@/utils/formatCurrency";
import { useTranslations } from "next-intl";

interface WalletCardProps {
  wallet: WalletInfo;
  onClick?: () => void;
  className?: string;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  onClick,
  className = "",
}) => {
  const t = useTranslations("account.rewardsCard");

  return (
    <div
      onClick={onClick}
      className={`bg-linear-to-r from-[#880E4F] via-[#AD1457] to-[#D81B60] rounded-3xl p-5 sm:p-6 text-white shadow-lg shadow-rose-900/20 relative overflow-hidden flex flex-col justify-between space-y-4 h-full ${
        onClick
          ? "cursor-pointer hover:opacity-95 hover:shadow-xl transition-all active:scale-[0.99]"
          : ""
      } ${className}`}
    >
      {/* Background Graphic Decoration */}
      <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
        <Wallet className="w-48 h-48 text-white" />
      </div>

      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2 text-white/95">
          <div className="p-1.5 bg-white/15 rounded-lg border border-white/20">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-xs sm:text-sm tracking-wider uppercase">
            {t("title")}
          </span>
        </div>

        <span className="bg-white/15 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 shrink-0">
          {t("instantCheckout")}
        </span>
      </div>

      {/* Middle Balance */}
      <div className="space-y-3 relative z-10 my-auto">
        <div className="space-y-1">
          <p className="text-xs text-rose-100/90 font-semibold tracking-wide">
            {t("availableCashback")}
          </p>
          <div className="flex flex-wrap items-baseline gap-3">
            <h3 className="text-2xl sm:text-3xl font-black text-white font-jakarta tracking-tight">
              {formatLKR(wallet.balance)}
            </h3>
          </div>
        </div>

        {/* Pending Cashback */}
        {typeof wallet.pendingCashback === "number" && (
          <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs">
            <span className="text-rose-100/80 font-medium">{t("pendingCashback")}</span>
            <span className="font-bold text-white bg-white/20 px-2.5 py-0.5 rounded-full border border-white/20">
              {formatLKR(wallet.pendingCashback)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
