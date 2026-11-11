"use client";

import React from "react";
import { Smartphone } from "lucide-react";
import { Input } from "@/components/base/Input";

import { formatMobileInput } from "@/utils/formatMobileNumber";
import { ROUTES } from "@/constants/routes";
import { GoogleSignInButton } from "../GoogleSignInButton";

interface MobileInputFormProps {
  mobileNumber: string;
  setMobileNumber: (val: string) => void;
  isSubmitting: boolean;
  onSendOtp: (e: React.FormEvent) => void;
  onGoogleCredential: (idToken: string, nonce: string) => void;
}

export const MobileInputForm: React.FC<MobileInputFormProps> = ({
  mobileNumber,
  setMobileNumber,
  isSubmitting,
  onSendOtp,
  onGoogleCredential,
}) => {
  return (
    <>
      {/* Modal Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Log In / Register
        </h2>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Enter mobile number to log in or create an account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSendOtp} className="space-y-4">
        <Input
          label="Mobile Number"
          badgeText="Instant OTP"
          type="tel"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(formatMobileInput(e.target.value))}
          placeholder="Enter Mobile Number"
          helperText="Dialog, Mobitel, Airtel, Hutch supported"
          prefixElement={
            <>
              <img
                src="/base/srilankaflag.png"
                alt="Sri Lanka Flag"
                className="w-5 h-3.5 rounded-xs object-cover shadow-2xs"
              />
              <span>LK +94</span>
            </>
          }
          required
          autoFocus
        />


        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-[#D81B60] hover:bg-[#C2185B] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
        >
          <Smartphone className="w-4 h-4" />
          <span>{isSubmitting ? "Sending code..." : "Send code via SMS"}</span>
        </button>
      </form>

      {/* Social Login Divider */}
      <div className="my-6 flex items-center text-xs text-slate-400 font-medium whitespace-nowrap before:content-[''] before:flex-1 before:border-b before:border-slate-200 before:mr-3 after:content-[''] after:flex-1 after:border-b after:border-slate-200 after:ml-3">
        Or, login with
      </div>

      {/* Google sign-in. Apple stays off on the web until its web flow
          (Services ID return URL for this site) is set up; a button that
          skipped sign-in used to sit here. */}
      <GoogleSignInButton
        onCredential={onGoogleCredential}
        disabled={isSubmitting}
      />

      {/* Terms Notice Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
          By signing in, you agree to SRIBEES Online’s{" "}
          <a href="#" className="underline hover:text-slate-600 transition-colors">
            Terms of Service
          </a>{" "}
          &{" "}
          <a
            href={ROUTES.PRIVACY_POLICY}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-600 transition-colors"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </>
  );
};

export default MobileInputForm;
