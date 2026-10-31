"use client";

import React from "react";
import { Smartphone } from "lucide-react";
import { Input } from "@/components/base/Input";

import { formatMobileInput } from "@/utils/formatMobileNumber";
import { ROUTES } from "@/constants/routes";

interface MobileInputFormProps {
  mobileNumber: string;
  setMobileNumber: (val: string) => void;
  isSubmitting: boolean;
  onSendOtp: (e: React.FormEvent) => void;
  onSocialLogin: () => void;
}

export const MobileInputForm: React.FC<MobileInputFormProps> = ({
  mobileNumber,
  setMobileNumber,
  isSubmitting,
  onSendOtp,
  onSocialLogin,
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

      {/* Social Buttons Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Google Login */}
        <button
          type="button"
          onClick={onSocialLogin}
          className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google</span>
        </button>

        {/* Apple Login */}
        <button
          type="button"
          onClick={onSocialLogin}
          className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
        >
          <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.58-.71.97-1.7.86-2.69-.84.03-1.87.56-2.47 1.26-.54.62-.99 1.63-.86 2.6 0 0 .1.01.14.01.76 0 1.75-.47 2.33-1.18z" />
          </svg>
          <span>Apple</span>
        </button>
      </div>

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
