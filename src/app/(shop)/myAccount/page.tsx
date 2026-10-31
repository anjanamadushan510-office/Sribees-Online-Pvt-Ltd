"use client";

import React, { useState, useEffect } from "react";
import { AccountHeader } from "./components/AccountHeader";
import { UserProfileCard } from "./components/UserProfileCard";
import { WalletCard } from "./components/WalletCard";
import {
  AccountNavigationTabs,
  AccountTabKey,
} from "./components/AccountNavigationTabs";
import { PersonalInfoForm } from "./components/PersonalInfoForm";
import { DeliveryAddressesSection } from "./components/DeliveryAddressesSection";
import { WalletTab } from "./components/WalletTab";
import { OrderHistoryTab } from "./components/OrderHistoryTab";
import {
  UserProfile,
  WalletInfo,
  DeliveryAddress,
} from "@/interfaces/account.interface";
import { useToastStore } from "@/state/toast.store";
import { useAuthStore } from "@/state/auth.store";
import { useGetMe } from "@/api/queries/useAuth";
import { useUIStore } from "@/state/ui.store";
import { useGetAddresses } from "@/api/queries/useAddresses";
import {
  useGetWalletBalance,
  useGetLoyaltySummary,
} from "@/api/queries/useWallet";
import { useGetOrders } from "@/api/queries/useOrders";
import { UnauntheticatedWarningBanner } from "@/components/UnauntheticatedWarningBanner";
import { useTranslations } from "next-intl";

import { EditProfileModal } from "./components/EditProfileModal";

export default function MyAccountPage() {
  const tGuest = useTranslations("account.guestBanner");
  const addToast = useToastStore((state) => state.addToast);
  const { user, isAuthenticated } = useAuthStore();
  const { data: meUser } = useGetMe();
  const { openLoginModal, selectedLocation } = useUIStore();

  const { data: addressesData } = useGetAddresses();
  const { data: walletData } = useGetWalletBalance();
  const { data: loyaltyData } = useGetLoyaltySummary();
  const { data: ordersData } = useGetOrders();

  const currentUser = meUser || user;

  // Tab State
  const [activeTab, setActiveTab] = useState<AccountTabKey>("personal_info");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const memberSinceFormatted = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently Joined";

  const profileName =
    currentUser?.fullName && currentUser.fullName.trim() !== ""
      ? currentUser.fullName
      : currentUser?.phone
        ? `Customer (${currentUser.phone})`
        : "Valued Customer";

  // Dynamic loyalty & tier calculation from server data
  const currentPoints = loyaltyData?.points ?? walletData?.points ?? 0;
  const currentTier = loyaltyData?.tier || walletData?.tier;
  const tierName = currentTier?.name
    ? currentTier.name.toUpperCase()
    : "MEMBER";
  const tierColor = currentTier?.color || "#9CA3AF";

  const nextTier = loyaltyData?.next_tier || walletData?.next_tier;
  const nextTierName = nextTier?.name || "Silver";
  const pointsToNextTier =
    nextTier?.points_needed ??
    (nextTier?.min_points !== undefined
      ? Math.max(0, nextTier.min_points - currentPoints)
      : 25);

  const [localAvatar, setLocalAvatar] = useState<string>("");

  useEffect(() => {
    const loadAvatar = () => {
      const saved = localStorage.getItem("sribees_local_avatar");
      setLocalAvatar(saved || "");
    };

    loadAvatar();
    window.addEventListener("sribees_avatar_updated", loadAvatar);
    return () => {
      window.removeEventListener("sribees_avatar_updated", loadAvatar);
    };
  }, []);

  const avatarUrl = currentUser?.profilePictureUrl || localAvatar || "";

  // Dynamic User Profile state driven by server state & auth store
  const profile: UserProfile = {
    name: profileName,
    email: currentUser?.email || "Not provided",
    nic: currentUser?.nic || "Not provided",
    primaryMobile: currentUser?.phone || "+94 -- --- ----",
    secondaryMobile: currentUser?.alternatePhone || "",
    tier: tierName,
    tierName: tierName,
    tierColor: tierColor,
    isVerified: Boolean(
      currentUser?.isVerified || currentUser?.isPhoneVerified,
    ),
    greenShopperPoints: currentPoints,
    memberSince: memberSinceFormatted,
    hubLocation: selectedLocation || "Colombo Central Hub",
    tierProgressPoints: currentPoints,
    pointsToNextTier: pointsToNextTier,
    nextTierName: nextTierName,
    avatarUrl: avatarUrl,
    accountId: currentUser?.userId
      ? `SR${currentUser.userId.substring(0, 6).toUpperCase()}`
      : "SR-GUEST",
  };

  // Wallet State
  const wallet: WalletInfo = {
    balance: walletData?.balance ?? 0,
    currency: walletData?.currency || "LKR",
    pendingCashback: walletData?.pending_cashback ?? 0,
    welcomeVoucherActive: false,
    welcomeVoucherAmount: 0,
    voucherDaysRemaining: 0,
  };

  const savedAddressesCount = addressesData?.length ?? 0;
  const ordersCount = ordersData?.total ?? ordersData?.orders?.length ?? 0;

  const handleUpdateProfile = (_updatedDetails: Partial<UserProfile>) => {
    // Dynamic profile updates automatically through react query & auth store
  };

  const handleAvatarClick = () => {
    setIsEditProfileOpen(true);
  };

  return (
    <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <UnauntheticatedWarningBanner
        title={tGuest("title")}
        message={tGuest("message")}
        buttonText={tGuest("buttonText")}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        initialName={currentUser?.fullName || ""}
        initialPhotoUrl={avatarUrl}
      />

      {/* Breadcrumb Header */}
      <AccountHeader
        branchName={selectedLocation || "Colombo Central (Bambalapitiya)"}
      />

      {/* Top Cards Section: Profile Card & Wallet Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 mb-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <UserProfileCard
            profile={profile}
            onAvatarClick={handleAvatarClick}
            onEditProfile={() => setIsEditProfileOpen(true)}
            className="h-full"
          />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <WalletCard
            wallet={wallet}
            onClick={() => setActiveTab("wallet")}
            className="h-full"
          />
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <AccountNavigationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedAddressesCount={savedAddressesCount}
        ordersCount={ordersCount}
      />

      {/* Dynamic Tab Content Views */}
      {activeTab === "personal_info" && (
        <div className="space-y-8 animate-fadeIn">
          <PersonalInfoForm profile={profile} onSave={handleUpdateProfile} />
          <DeliveryAddressesSection />
        </div>
      )}

      {activeTab === "saved_addresses" && (
        <div className="animate-fadeIn">
          <DeliveryAddressesSection />
        </div>
      )}

      {activeTab === "wallet" && (
        <div className="animate-fadeIn">
          <WalletTab wallet={wallet} />
        </div>
      )}

      {activeTab === "orders" && (
        <div className="animate-fadeIn">
          <OrderHistoryTab />
        </div>
      )}
    </main>
  );
}
