"use client";

import React from "react";
import { LockKeyhole, ArrowRight, ShieldCheck } from "lucide-react";

interface OTPScreenProps {
  mobileNumber: string;
  otpCode: string[];
  handleOtpChange: (index: number, value: string) => void;
  handleOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
  onVerifyOtp: (e?: React.FormEvent) => void;
  canResend: boolean;
  handleResendOtp: () => void;
  timer: number;
  formatSeconds: (sec: number) => string;
  onEditMobile: () => void;
}

export const OTPScreen: React.FC<OTPScreenProps> = ({
  mobileNumber,
  otpCode,
  handleOtpChange,
  handleOtpKeyDown,
  isSubmitting,
  onVerifyOtp,
  canResend,
  handleResendOtp,
  timer,
  formatSeconds,
  onEditMobile,
}) => {
  return (
    <form onSubmit={(e) => onVerifyOtp(e)} className="space-y-4">
      {/* Pink Lock Icon Circle Badge */}
      <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-[#D81B60] mx-auto mb-3 shadow-xs">
        <LockKeyhole className="w-7 h-7 stroke-[2.2]" />
      </div>

      {/* Title & Sent Notice */}
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Enter Verification Code
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
          We have sent a 6–digit OTP code via SMS to
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-0.5">
          <span className="text-xs font-bold text-slate-900">
            +94 {mobileNumber || "77 123 4567"}
          </span>
          <button
            type="button"
            onClick={onEditMobile}
            className="text-xs font-bold text-[#D81B60] hover:underline cursor-pointer"
          >
            Edit
          </button>
        </div>
      </div>

      {/* 6-Digit OTP Boxes */}
      <div className="grid grid-cols-6 gap-2 my-5">
        {otpCode.map((digit, idx) => (
          <input
            key={idx}
            id={`otp-input-${idx}`}
            type="text"
            maxLength={6}
            value={digit}
            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
            onChange={(e) => handleOtpChange(idx, e.target.value)}
            className="w-full h-13 sm:h-14 text-center text-xl font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:border-2 focus:border-[#D81B60] focus:bg-white focus:ring-4 focus:ring-rose-100 transition-all outline-none"
            autoFocus={idx === 0}
          />
        ))}
      </div>

      <p className="text-[11px] text-slate-400 font-medium text-center -mt-2 mb-4">
        Code will auto-verify once all digits are entered
      </p>

      {/* Submit / Verify Button */}
      <button
        type="submit"
        disabled={isSubmitting || otpCode.some((d) => !d)}
        className="w-full py-3.5 px-6 bg-[#D81B60] hover:bg-[#C2185B] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
      >
        <span>{isSubmitting ? "Verifying..." : "Verify & Log In"}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Countdown / Resend OTP */}
      <div className="text-center pt-2 text-xs font-medium text-slate-500">
        {canResend ? (
          <span>
            Didn’t receive code?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-[#D81B60] font-bold hover:underline cursor-pointer"
            >
              Resend OTP via SMS
            </button>
          </span>
        ) : (
          <div className="flex items-center justify-center gap-1.5">
            <span>Resend OTP via SMS in</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-mono text-xs font-bold">
              {formatSeconds(timer)}
            </span>
          </div>
        )}
      </div>

      {/* Footer Security Notice */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>End-to-End Encrypted • Sri Lanka Data Protection Compliant</span>
        </div>
        <p className="text-[11px] text-slate-400 font-medium">
          Need help? Call <strong className="text-slate-600">+94 11 234 5678</strong>
        </p>
      </div>
    </form>
  );
};

export default OTPScreen;
