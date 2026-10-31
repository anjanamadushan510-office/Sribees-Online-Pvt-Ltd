"use client";

import React, { useState } from "react";
import {
  Leaf,
  Copy,
  Check,
  Pencil,
  Award,
} from "lucide-react";
import { UserProfile } from "@/interfaces/account.interface";
import { useToastStore } from "@/state/toast.store";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/Avatar";

interface UserProfileCardProps {
  profile: UserProfile;
  onAvatarClick?: () => void;
  onEditProfile?: () => void;
  className?: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  profile,
  onAvatarClick,
  onEditProfile,
  className = "",
}) => {
  const t = useTranslations("account.profileCard");
  const [copied, setCopied] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const accountId = profile.accountId || "SRD81C58";
  const tierName = profile.tierName || "MEMBER";

  const handleCopy = () => {
    navigator.clipboard.writeText(accountId);
    setCopied(true);
    addToast({
      title: t("copiedToastTitle"),
      message: `${accountId} ${t("copiedToastMessage")}`,
      type: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenEdit = () => {
    if (onEditProfile) {
      onEditProfile();
    } else if (onAvatarClick) {
      onAvatarClick();
    }
  };

  // Points and tier details
  const currentPoints = profile.greenShopperPoints ?? 0;
  const pointsNeeded = profile.pointsToNextTier ?? 0;
  const nextTierName = profile.nextTierName || "Silver";

  return (
    <div className={`bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5 relative h-full ${className}`}>
      {/* Top Main Details */}
      <div className="flex items-start gap-4">
        {/* Avatar with Circular initials fallback and Camera Button */}
        <Avatar
          src={profile.avatarUrl}
          name={profile.name}
          size="lg"
          showEditButton
          onEditClick={handleOpenEdit}
          editButtonTitle={t("updatePhoto")}
        />

        {/* User Info */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
              {profile.name}
            </h2>

            {/* Grey Membership Badge (Positioned at right corner of the row) */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-300 rounded-full shadow-2xs shrink-0">
              <Award className="w-3 h-3 text-slate-500" />
              <span>{tierName}</span>
            </span>
          </div>

          {/* Loyalty Points & Membership Progress (e.g. 0 Points – 25 more points to Silver) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 pt-0.5">
            <div className="flex items-center gap-1">
              <Leaf className="w-4 h-4 text-emerald-600 fill-emerald-100" />
              <span className="text-emerald-800 font-extrabold">
                {currentPoints.toLocaleString()} {t("points")}
              </span>
            </div>

            {pointsNeeded > 0 && nextTierName && (
              <span className="text-slate-500 font-semibold text-xs flex items-center gap-1">
                <span>–</span>
                <span>
                  {pointsNeeded} {t("morePointsTo")} {nextTierName}
                </span>
              </span>
            )}
          </div>

          {/* Member info */}
          <p className="text-xs text-slate-500 font-medium pt-0.5">
            {t("memberSince")} {profile.memberSince} • {profile.hubLocation}
          </p>

          {/* Account ID Display, Copy Button & Edit Profile Action */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                {t("accountId")}:{" "}
                <strong className="font-mono text-slate-800 font-bold">
                  {accountId}
                </strong>
              </span>
              <button
                type="button"
                onClick={handleCopy}
                title={t("copy")}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-all cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">{t("copied")}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-500" />
                    <span>{t("copy")}</span>
                  </>
                )}
              </button>
            </div>

            {/* Edit Profile Action Button */}
            <button
              type="button"
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#D81B60] bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              <Pencil className="w-3 h-3" />
              <span>{t("editProfile")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
