"use client";

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { useTranslations } from "next-intl";

interface DangerZoneCardProps {
  walletBalanceFormatted?: string;
}

export const DangerZoneCard: React.FC<DangerZoneCardProps> = ({
  walletBalanceFormatted = "LKR 4,850.00",
}) => {
  const t = useTranslations("account");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <div className="bg-rose-50/70 border border-rose-200/90 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-rose-900 leading-snug">
              {t("settings.dangerZoneTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-rose-700/90 font-medium mt-0.5 leading-relaxed">
              {t("settings.dangerZoneDesc", { walletBalanceFormatted })}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="bg-[#B71C1C] hover:bg-[#991B1B] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full cursor-pointer shadow-md transition-all shrink-0 active:scale-95 self-start md:self-center"
        >
          {t("settings.deleteAccountBtn")}
        </button>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        walletBalanceFormatted={walletBalanceFormatted}
      />
    </>
  );
};
