"use client";

import React from "react";
import { Breadcrumb } from "@/components/Breadcumb";
import { Header } from "@/components/Header";
import { ROUTES } from "@/constants/routes";
import { LocalizationCard } from "./components/LocalizationCard";
import { NotificationsCard } from "./components/NotificationsCard";
import { PrivacyProtectionCard } from "./components/PrivacyProtectionCard";
import { ActiveSessionsCard } from "./components/ActiveSessionsCard";
import { DangerZoneCard } from "./components/DangerZoneCard";
import { SecuritySupportBanner } from "./components/SecuritySupportBanner";
import { UnauntheticatedWarningBanner } from "@/components/UnauntheticatedWarningBanner";
import { useGetWalletBalance } from "@/api/queries/useWallet";
import { formatLKR } from "@/utils/formatCurrency";
import { useTranslations } from "next-intl";

export default function AccountSettingsPage() {
  const t = useTranslations("account");
  const { data: walletData } = useGetWalletBalance();

  const formattedWalletBalance =
    walletData?.balance !== undefined
      ? formatLKR(walletData.balance)
      : "LKR 4,850.00";

  return (
    <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Guest Warning Banner if unauthenticated */}
      <UnauntheticatedWarningBanner
        title={t("settings.demoModeTitle")}
        message={t("settings.demoModeMessage")}
        buttonText={t("guestBanner.buttonText")}
      />

      {/* Header & Breadcrumbs */}
      <div className="mb-8">
        <Breadcrumb
          items={[
            { label: t("header.breadcrumb"), href: ROUTES.MY_ACCOUNT },
            { label: t("settings.breadcrumb") },
          ]}
          className="mb-3"
        />

        <Header
          title={t("settings.headerTitle")}
          description={t("settings.headerDescription")}
        />
      </div>

      {/* Grid Row 1: Localization & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <LocalizationCard />
        <NotificationsCard />
      </div>

      {/* Grid Row 2: Privacy & Active Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PrivacyProtectionCard />
        <ActiveSessionsCard />
      </div>

      {/* Danger Zone: Account Deletion */}
      <DangerZoneCard walletBalanceFormatted={formattedWalletBalance} />

      {/* Support & Privacy Desk Banner */}
      <SecuritySupportBanner />
    </main>
  );
}
