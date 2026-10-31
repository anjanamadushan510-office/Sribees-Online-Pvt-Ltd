"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  User,
  Mail,
  CreditCard,
  Phone,
  Smartphone,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { UserProfile } from "@/interfaces/account.interface";
import { useToastStore } from "@/state/toast.store";
import { Input } from "@/components/base/Input";
import { Header } from "@/components/Header";
import { useUpdateProfile } from "@/api/queries/useAuth";
import { getSriLankanOperator } from "@/utils/formatMobileNumber";
import { useTranslations } from "next-intl";

interface PersonalInfoFormProps {
  profile: UserProfile;
  onSave?: (updatedProfile: Partial<UserProfile>) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  profile,
  onSave,
}) => {
  const t = useTranslations("account.personalInfo");
  const addToast = useToastStore((state) => state.addToast);
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    name: profile.name === "Valued Customer" ? "" : profile.name,
    email: profile.email === "Not provided" ? "" : profile.email,
    nic: profile.nic === "Not provided" ? "" : profile.nic,
    primaryMobile: profile.primaryMobile,
    secondaryMobile: profile.secondaryMobile || "",
  });

  const primaryOperator = getSriLankanOperator(formData.primaryMobile);
  const secondaryOperator = getSriLankanOperator(formData.secondaryMobile);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      name: profile.name === "Valued Customer" ? "" : profile.name,
      email: profile.email === "Not provided" ? "" : profile.email,
      nic: profile.nic === "Not provided" ? "" : profile.nic,
      primaryMobile: profile.primaryMobile,
      secondaryMobile: profile.secondaryMobile || "",
    });
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData({
      name: profile.name === "Valued Customer" ? "" : profile.name,
      email: profile.email === "Not provided" ? "" : profile.email,
      nic: profile.nic === "Not provided" ? "" : profile.nic,
      primaryMobile: profile.primaryMobile,
      secondaryMobile: profile.secondaryMobile || "",
    });
    addToast({
      title: "Changes Reverted",
      message: "Personal info form has been reset to original details.",
      type: "info",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateProfileMutation.mutateAsync({
        full_name: formData.name.trim() || undefined,
        email: formData.email.trim() || undefined,
      });

      if (onSave) {
        onSave(formData);
      }

      addToast({
        title: "Profile Updated Successfully",
        message: "Your personal details have been securely saved.",
        type: "success",
      });
    } catch (err: unknown) {
      const error = err as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      addToast({
        title: "Update Failed",
        message:
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to update profile.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs mb-8 space-y-6">
      {/* Header */}
      <Header
        headingTag="h2"
        size="md"
        title={t("title")}
        description={t("description")}
        borderBottom
        actions={
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-extrabold text-emerald-700 shrink-0 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t("kycVerified")}</span>
          </div>
        }
      />

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {/* Full Name */}
          <Input
            label={t("fullName")}
            required
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder={t("fullNamePlaceholder")}
            helperText={t("fullNameHelper")}
          />

          {/* Email Address */}
          <Input
            label={t("email")}
            required
            badgeText={
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full">
                <CheckCircle2 className="w-2.5 h-2.5" /> {t("emailVerified")}
              </span>
            }
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            rightIcon={<Lock className="w-3.5 h-3.5 text-slate-400" />}
            type="email"
            value={formData.email}
            disabled
            readOnly
            helperText={t("emailHelper")}
          />

          {/* National ID (NIC) */}
          <Input
            label={t("nic")}
            badgeText={<Lock className="w-3.5 h-3.5 text-slate-400" />}
            leftIcon={<CreditCard className="w-4 h-4 text-slate-400" />}
            rightIcon={<Lock className="w-3.5 h-3.5 text-slate-400" />}
            type="text"
            value={formData.nic}
            disabled
            readOnly
            helperText={t("nicHelper")}
          />

          {/* Primary Mobile */}
          <Input
            label={t("primaryMobile")}
            required
            badgeText={
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full">
                <CheckCircle2 className="w-2.5 h-2.5" />{" "}
                {primaryOperator ? t("operatorVerified", { operator: primaryOperator }) : t("verified")}
              </span>
            }
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
            rightIcon={<Lock className="w-3.5 h-3.5 text-slate-400" />}
            type="text"
            value={formData.primaryMobile}
            disabled
            readOnly
            helperText={t("primaryMobileHelper")}
          />

          {/* Secondary Mobile */}
          <Input
            label={t("secondaryMobile")}
            badgeText={
              <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded-full">
                {secondaryOperator ? t("operatorOptional", { operator: secondaryOperator }) : t("optional")}
              </span>
            }
            leftIcon={<Smartphone className="w-4 h-4 text-slate-400" />}
            type="text"
            value={formData.secondaryMobile}
            onChange={(e) => handleChange("secondaryMobile", e.target.value)}
            placeholder={t("secondaryMobilePlaceholder")}
            helperText={t("secondaryMobileHelper")}
          />

          {/* Actions (Cancel & Save Changes) */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-1.5 min-h-[22px]">
              <label className="text-xs font-bold text-slate-700 block leading-none">
                {t("actions")}
              </label>
            </div>
            <div className="flex items-center gap-2.5 h-[42px]">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 h-full px-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[1.5] h-full px-4 bg-[#D81B60] hover:bg-[#C2185B] text-white text-xs font-bold rounded-xl shadow-md shadow-rose-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? t("saving") : t("saveChanges")}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">
              {t("actionsHelper")}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
