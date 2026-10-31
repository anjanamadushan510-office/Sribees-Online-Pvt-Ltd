"use client";

import React from "react";
import {
  CheckCircle2,
  User,
  CreditCard,
  Mail,
  Gift,
  ArrowRight,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { Input } from "@/components/base/Input";
import { ProfileField } from "@/interfaces/auth.interface";

interface CompleteAccountSetupProps {
  mobileNumber: string;
  fullName: string;
  setFullName: (val: string) => void;
  nicNumber: string;
  setNicNumber: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  referralCode: string;
  setReferralCode: (val: string) => void;
  missingFields: ProfileField[];
  errors: Partial<Record<ProfileField, string>>;
  isSubmitting: boolean;
  onCompleteSignUp: (e: React.FormEvent) => void;
}

export const CompleteAccountSetup: React.FC<CompleteAccountSetupProps> = ({
  mobileNumber,
  fullName,
  setFullName,
  nicNumber,
  setNicNumber,
  email,
  setEmail,
  referralCode,
  setReferralCode,
  missingFields,
  errors,
  isSubmitting,
  onCompleteSignUp,
}) => {
  const asks = (field: ProfileField) => missingFields.includes(field);
  const lockIcon = (field: ProfileField) =>
    asks(field) ? undefined : <Lock className="w-3.5 h-3.5 text-slate-400" />;

  return (
    <form onSubmit={onCompleteSignUp} className="space-y-4">
      {/* Title & Verified Phone Badge */}
      <div className="text-center mb-3">
        <h2 className="text-xl font-black text-slate-900">
          Complete Account Setup
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Please fill in your details to finalize your account
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified: +94 {mobileNumber || "77 123 4567"}</span>
        </div>
      </div>

      {/* Form Input Fields Grid using Base Input Component */}
      <div className="space-y-3">
        {/* A field is asked for only while the account lacks it; one already
            saved (here or in the mobile app) is shown locked. */}

        {/* Full Name */}
        {(asks("full_name") || fullName) && (
          <Input
            label="Full Name"
            required
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            rightIcon={lockIcon("full_name")}
            readOnly={!asks("full_name")}
            error={errors.full_name}
            autoFocus={asks("full_name")}
          />
        )}

        {/* NIC Number */}
        {(asks("nic") || nicNumber) && (
          <Input
            label="NIC Number"
            required
            type="text"
            value={nicNumber}
            onChange={(e) => setNicNumber(e.target.value)}
            placeholder="e.g. 199012345678 or 901234567V"
            leftIcon={<CreditCard className="w-4 h-4 text-slate-400" />}
            rightIcon={lockIcon("nic")}
            readOnly={!asks("nic")}
            error={errors.nic}
            inputClassName="uppercase"
          />
        )}

        {/* Email Address */}
        {(asks("email") || email) && (
          <Input
            label="Email Address"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            rightIcon={lockIcon("email")}
            readOnly={!asks("email")}
            error={errors.email}
          />
        )}

        {/* Referral Code (Optional) */}
        <Input
          label="Referral Code"
          optionalText="Optional"
          type="text"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          placeholder="Enter referral code if any"
          leftIcon={<Gift className="w-4 h-4 text-slate-400" />}
          inputClassName="uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal"
        />
      </div>

      {/* Submit CTA Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 bg-[#D81B60] hover:bg-[#C2185B] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer mt-5 disabled:opacity-75"
      >
        <span>
          {isSubmitting ? "Creating Account..." : "Create Account & Login"}
        </span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Security Footer Notice */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            End-to-End Encrypted • Sri Lanka Data Protection Compliant
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          Need help? Call{" "}
          <strong className="text-slate-600">+94 11 234 5678</strong>
        </p>
      </div>
    </form>
  );
};

export default CompleteAccountSetup;
