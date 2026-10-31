"use client";

import React from "react";
import { ShieldCheck, CreditCard, Truck, UserCheck, Lock, CheckCircle2 } from "lucide-react";

export const PrivacyCards: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 2 Main Big Focus Cards: Data Protection & Payment Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Data Protection */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#D81B60] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                How Your Data is Protected
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Personal details & contact information
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            We collect only the basic information needed to process your grocery orders — your name, mobile number for login verification, and delivery address.
          </p>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Never Sold or Shared:</strong> We never sell, rent, or trade your phone number, address, or shopping habits to external advertisers or telemarketers.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Encrypted & Secured:</strong> All customer data is stored securely using industry-standard encryption protocols.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>OTP Authentication:</strong> Your account is protected with secure SMS One-Time Passwords (OTP) so only you can access your profile.
              </span>
            </li>
          </ul>
        </div>

        {/* Card 2: Payment Security */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Payment & Transaction Security
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Safe checkout with zero card storage
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Whether you choose online card payment or Cash on Delivery, your transactions are 100% safe and secure.
          </p>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Card Storage:</strong> SRIBEES does not store your credit or debit card numbers, PINs, or CVV security codes on our servers.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Bank-Grade 256-Bit SSL:</strong> All online card payments are processed through certified, PCI-DSS compliant Sri Lankan payment gateways with 3D Secure verification.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Verified Cash on Delivery:</strong> Pay safely at your doorstep with instant digital SMS receipts for complete peace of mind.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 2 Supporting Points: Order Delivery & Your Control */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Order Delivery Usage */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Delivery Use Only
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your delivery address and phone number are only shared with your assigned rider while delivering your groceries. Once the delivery is complete, details are closed on the rider's device.
          </p>
        </div>

        {/* User Control & Account */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Your Control & Choice
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            You have full control over your information. You can edit saved addresses, update your preferences, or delete your account anytime directly from your Account Settings.
          </p>
        </div>
      </div>
    </div>
  );
};
