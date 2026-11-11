"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Tag,
  ShieldCheck,
  Lock,
  CreditCard,
  Wallet,
  Banknote,
  HelpCircle,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { formatLKR } from "@/utils/formatCurrency";
import { AddressOption } from "./AddressChangeModal";
import { useAuthStore } from "@/state/auth.store";
import { useUIStore } from "@/state/ui.store";
import { formatMobileInput, isDummyPhone } from "@/utils/formatMobileNumber";
import { AvailableCouponsModal } from "./AvailableCouponsModal";

interface OrderSummarySidebarProps {
  subtotal: number;
  itemCount: number;
  deliveryFee: number;
  couponDiscount: number;
  couponCode: string;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  cashbackEarned?: number;

  // Wallet
  walletBalance: number;
  walletAppliedAmount: number;
  onApplyWalletMax: () => void;
  onUpdateWalletAmount: (val: number) => void;

  // Selected address & payment
  selectedAddress: AddressOption;
  onChangeAddressClick: () => void;
  selectedPayment: "wallet" | "card" | "cod";
  onSelectPayment: (method: "wallet" | "card" | "cod") => void;

  // Split payment support
  secondaryPayment: "card" | "cod" | null;
  onSelectSecondaryPayment: (method: "card" | "cod") => void;
  needsSecondaryPayment: boolean;
  remainingAfterWallet: number;

  // Place order
  onPlaceOrder: () => void;
  // The second number the rider can call. Required on every order.
  alternatePhone: string;
  onAlternatePhoneChange: (val: string) => void;
  alternatePhoneError?: string | null;
}

export const OrderSummarySidebar: React.FC<OrderSummarySidebarProps> = ({
  subtotal,
  itemCount,
  deliveryFee,
  couponDiscount,
  couponCode,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  cashbackEarned = 0,
  walletBalance,
  walletAppliedAmount,
  onApplyWalletMax,
  onUpdateWalletAmount,
  selectedAddress,
  onChangeAddressClick,
  selectedPayment,
  onSelectPayment,
  secondaryPayment,
  onSelectSecondaryPayment,
  needsSecondaryPayment,
  remainingAfterWallet,
  onPlaceOrder,
  alternatePhone,
  onAlternatePhoneChange,
  alternatePhoneError,
}) => {
  const t = useTranslations("checkout");
  const [couponInput, setCouponInput] = useState(couponCode);
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false);

  // Total calculation
  const totalBeforeWallet = Math.max(
    0,
    subtotal + deliveryFee - couponDiscount,
  );
  const finalTotal = Math.max(0, totalBeforeWallet - walletAppliedAmount);

  // Local state for wallet input field to allow smooth typing without instant clamping/resetting
  const [walletInputStr, setWalletInputStr] = useState<string>(() =>
    walletAppliedAmount > 0 ? String(walletAppliedAmount) : "0"
  );
  const debounceWalletRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local input in sync whenever walletAppliedAmount changes externally (e.g. Apply Max or payment selection)
  useEffect(() => {
    setWalletInputStr(walletAppliedAmount > 0 ? String(walletAppliedAmount) : "0");
  }, [walletAppliedAmount]);

  const handleWalletInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty string, or digits with up to 2 decimal places
    if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
      setWalletInputStr(val);

      if (debounceWalletRef.current) clearTimeout(debounceWalletRef.current);
      debounceWalletRef.current = setTimeout(() => {
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) {
          onUpdateWalletAmount(0);
        } else {
          const maxUse = Math.min(walletBalance, totalBeforeWallet);
          onUpdateWalletAmount(Math.min(num, maxUse));
        }
      }, 500);
    }
  };

  const handleWalletInputBlur = () => {
    if (debounceWalletRef.current) clearTimeout(debounceWalletRef.current);
    const num = parseFloat(walletInputStr);
    if (isNaN(num) || num <= 0) {
      setWalletInputStr("0");
      onUpdateWalletAmount(0);
    } else {
      const maxUse = Math.min(walletBalance, totalBeforeWallet);
      const clamped = Math.round(Math.min(num, maxUse) * 100) / 100;
      setWalletInputStr(String(clamped));
      onUpdateWalletAmount(clamped);
    }
  };

  const handleWalletInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Auto-select text so typing immediately overwrites without backspace struggle
    e.target.select();
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      onApplyCoupon(couponInput.trim());
    }
  };

  const handleSelectCoupon = (code: string) => {
    setCouponInput(code);
    onApplyCoupon(code);
  };

  // Resolve customer display name if address name is generic or placeholder
  const { user } = useAuthStore();
  const { userProfile } = useUIStore();
  const customerDisplayName =
    user?.fullName ||
    (userProfile?.name && userProfile.name !== "Valued Customer"
      ? userProfile.name
      : "") ||
    "";

  const recipientDisplayName =
    selectedAddress.name &&
    selectedAddress.name !== "Valued Customer" &&
    selectedAddress.name !== "Customer"
      ? selectedAddress.name
      : customerDisplayName || selectedAddress.name || "Customer";

  // Resolve customer phone number if address contact is dummy or missing
  const primaryPhone =
    !isDummyPhone(selectedAddress.contact) && selectedAddress.contact
      ? selectedAddress.contact
      : user?.phone || selectedAddress.contact || "";

  const displayContact = primaryPhone;

  return (
    <div className="space-y-4">
      {/* Main White Card Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-6">
        {/* Title */}
        <h2 className="text-xl font-black text-slate-900">
          {t("summary.title")}
        </h2>

        {/* PROMOTIONAL COUPON Section */}
        <div className="space-y-2">
          <label className="text-[11px] font-black tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>{t("sidebar.promoTitle")}</span>
          </label>

          <form onSubmit={handleCouponSubmit} className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder={t("sidebar.promoPlaceholder")}
              className="flex-1 px-4 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 tracking-wide uppercase focus:outline-none focus:border-[#D81B60] focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
            >
              {t("sidebar.apply")}
            </button>
          </form>

          {/* Applied Coupon Status */}
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200/70 rounded-xl text-xs font-extrabold text-emerald-700">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </span>
                <span>'{appliedCoupon}' Applied!</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-800 font-black">
                  -{formatLKR(couponDiscount)}
                </span>
                <button
                  onClick={onRemoveCoupon}
                  className="text-rose-600 hover:underline text-[11px] font-bold cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 font-medium italic"></p>
          )}

          {/* Available Coupons Link */}
          <button
            type="button"
            onClick={() => setIsCouponsModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-extrabold text-[#D81B60] hover:text-[#C2185B] transition-colors cursor-pointer group"
          >
            <Tag className="w-3 h-3" />
            <span>Available Coupons</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Cost Breakdown Rows */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
          <div className="flex justify-between items-center">
            <span>
              {t("summary.subtotal")} ({itemCount})
            </span>
            <span className="font-extrabold text-slate-900">
              {formatLKR(subtotal)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              {t("summary.deliveryFee")}
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </span>
            <span className="font-extrabold text-slate-900">
              {formatLKR(deliveryFee)}
            </span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex justify-between items-center text-[#D81B60]">
              <span>{t("summary.discount")}</span>
              <span className="font-black">-{formatLKR(couponDiscount)}</span>
            </div>
          )}

          {cashbackEarned > 0 && (
            <div className="flex justify-between items-center py-1.5 px-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="flex items-center gap-1 text-amber-700 font-extrabold text-[11px]">
                🎁 Total Cashback Earned
              </span>
              <span className="font-black text-amber-700 text-[11px]">
                +{formatLKR(cashbackEarned)}
              </span>
            </div>
          )}

          {walletAppliedAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-600 font-bold">
              <span className="flex items-center gap-1">
                💳 Wallet Deduction
              </span>
              <span className="font-black">-{formatLKR(walletAppliedAmount)}</span>
            </div>
          )}
        </div>

        {/* ESTIMATED TOTAL Box */}
        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black tracking-wider text-slate-600 uppercase block">
              {t("summary.total")}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              Includes all local taxes
            </span>
          </div>
          <div className="text-2xl font-black text-[#D81B60] tracking-tight">
            {formatLKR(finalTotal)}
          </div>
        </div>

        {/* STEP 1: Delivery Address */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#B7094C] text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">
                {t("delivery.addressTitle")}
              </h3>
            </div>
            <button
              onClick={onChangeAddressClick}
              className="text-xs font-black text-[#D81B60] hover:underline cursor-pointer"
            >
              {t("delivery.changeAddress")}
            </button>
          </div>

          <div className="bg-slate-100/60 rounded-2xl p-3.5 space-y-1 text-xs text-slate-700">
            <div className="font-extrabold text-slate-900 text-sm">
              {recipientDisplayName}
            </div>
            <div className="font-medium text-slate-600">
              {selectedAddress.address}
            </div>
            <div className="font-medium text-slate-500 pt-0.5">
              {displayContact ? `${displayContact} • ` : ""}
              <span className="font-bold">{selectedAddress.tag}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="checkout-alt-phone"
              className="text-[11px] font-black tracking-wider text-slate-500 uppercase block"
            >
              {t("delivery.altPhoneLabel")} *
            </label>
            <input
              id="checkout-alt-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={alternatePhone}
              onChange={(e) =>
                onAlternatePhoneChange(formatMobileInput(e.target.value))
              }
              placeholder="07X XXX XXXX"
              aria-invalid={Boolean(alternatePhoneError)}
              className={`w-full px-4 py-2.5 bg-slate-100/70 border rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:bg-white transition-all ${
                alternatePhoneError
                  ? "border-rose-400 focus:border-rose-500"
                  : "border-slate-200 focus:border-[#D81B60]"
              }`}
            />
            <p
              className={`text-[10px] font-medium ${
                alternatePhoneError ? "text-rose-600" : "text-slate-400"
              }`}
            >
              {alternatePhoneError || t("delivery.altPhoneHint")}
            </p>
          </div>
        </div>

        {/* STEP 2: Select Payment */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#B7094C] text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">
                {t("payment.title")}
              </h3>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
              <Lock className="w-3 h-3 text-emerald-600" />
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Sub-option 1: SRIBEES Cash Wallet */}
            <div
              className={`rounded-2xl border p-3.5 transition-all cursor-pointer ${
                selectedPayment === "wallet"
                  ? "border-[#D81B60] bg-rose-50/30 shadow-2xs"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
              onClick={() => onSelectPayment("wallet")}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === "wallet"}
                    onChange={() => onSelectPayment("wallet")}
                    className="accent-[#D81B60] w-4 h-4 cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs">
                    <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" />
                    <span>{t("payment.wallet")}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPayment("wallet");
                    onApplyWalletMax();
                  }}
                  className="px-2.5 py-1 bg-[#D81B60] hover:bg-[#C2185B] text-white font-extrabold text-[10px] rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  {t("sidebar.applyMax")}
                </button>
              </div>

              <div className="pl-6 pt-1 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  {t("payment.walletBalance")} {formatLKR(walletBalance)}
                </span>
              </div>

              {selectedPayment === "wallet" && (
                <div
                  className="pl-6 pt-2.5 space-y-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5 pr-3 focus-within:border-[#D81B60] focus-within:ring-1 focus-within:ring-[#D81B60] transition-colors">
                    <span className="text-xs font-bold text-slate-500 pl-1">
                      LKR
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={walletInputStr}
                      onChange={handleWalletInputChange}
                      onBlur={handleWalletInputBlur}
                      onFocus={handleWalletInputFocus}
                      placeholder="0"
                      className="w-24 text-xs font-black text-slate-900 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 font-semibold">
                      applied to order
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Remaining order balance will be charged via another payment
                    method below if partial.
                  </p>
                </div>
              )}
            </div>

            {/* Split Payment Secondary Section — shown when wallet is active with remaining balance */}
            {needsSecondaryPayment && (
              <div className="ml-2 pl-3 border-l-2 border-rose-200 space-y-2">
                <p className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-black">⚡</span>
                  Pay remaining <span className="text-[#D81B60] font-black">{formatLKR(remainingAfterWallet)}</span> via:
                </p>

                {/* Secondary: Credit / Debit Card */}
                <div
                  className={`rounded-2xl border p-3 transition-all cursor-pointer flex items-center justify-between ${
                    secondaryPayment === "card"
                      ? "border-[#D81B60] bg-rose-50/30 shadow-2xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                  onClick={() => onSelectSecondaryPayment("card")}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="secondary_payment"
                      checked={secondaryPayment === "card"}
                      onChange={() => onSelectSecondaryPayment("card")}
                      className="accent-[#D81B60] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs">
                        {t("payment.card")}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Visa, Mastercard, LankaQR
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div
                      title="Visa"
                      className="h-6 px-1.5 bg-white border border-slate-200 rounded-md flex items-center justify-center shadow-2xs"
                    >
                      <img
                        src="/footer/visa.png"
                        alt="Visa"
                        className="h-3 w-auto object-contain"
                      />
                    </div>
                    <div
                      title="Mastercard"
                      className="h-6 px-1.5 bg-white border border-slate-200 rounded-md flex items-center justify-center shadow-2xs"
                    >
                      <img
                        src="/footer/card.png"
                        alt="Mastercard"
                        className="h-4.5 w-auto object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Secondary: Cash on Delivery */}
                <div
                  className={`rounded-2xl border p-3 transition-all cursor-pointer flex items-center justify-between ${
                    secondaryPayment === "cod"
                      ? "border-[#D81B60] bg-rose-50/30 shadow-2xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                  onClick={() => onSelectSecondaryPayment("cod")}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="secondary_payment"
                      checked={secondaryPayment === "cod"}
                      onChange={() => onSelectSecondaryPayment("cod")}
                      className="accent-[#D81B60] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs">
                        {t("payment.cod")}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Pay when delivered
                      </div>
                    </div>
                  </div>

                  <Banknote className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            )}

            {/* Full Card option — shown only when wallet is NOT selected */}
            {selectedPayment !== "wallet" && (
              <>
                {/* Sub-option 2: Credit / Debit Card */}
                <div
                  className={`rounded-2xl border p-3.5 transition-all cursor-pointer flex items-center justify-between ${
                    selectedPayment === "card"
                      ? "border-[#D81B60] bg-rose-50/30 shadow-2xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                  onClick={() => onSelectPayment("card")}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPayment === "card"}
                      onChange={() => onSelectPayment("card")}
                      className="accent-[#D81B60] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs">
                        {t("payment.card")}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Visa, Mastercard, LankaQR
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div
                      title="Visa"
                      className="h-6 px-1.5 bg-white border border-slate-200 rounded-md flex items-center justify-center shadow-2xs"
                    >
                      <img
                        src="/footer/visa.png"
                        alt="Visa"
                        className="h-3 w-auto object-contain"
                      />
                    </div>
                    <div
                      title="Mastercard"
                      className="h-6 px-1.5 bg-white border border-slate-200 rounded-md flex items-center justify-center shadow-2xs"
                    >
                      <img
                        src="/footer/card.png"
                        alt="Mastercard"
                        className="h-4.5 w-auto object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-option 3: Cash on Delivery (COD) */}
                <div
                  className={`rounded-2xl border p-3.5 transition-all cursor-pointer flex items-center justify-between ${
                    selectedPayment === "cod"
                      ? "border-[#D81B60] bg-rose-50/30 shadow-2xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                  onClick={() => onSelectPayment("cod")}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="payment"
                      checked={selectedPayment === "cod"}
                      onChange={() => onSelectPayment("cod")}
                      className="accent-[#D81B60] w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs">
                        {t("payment.cod")}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Pay when delivered
                      </div>
                    </div>
                  </div>

                  <Banknote className="w-5 h-5 text-emerald-600" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Place Order Button */}
        <div className="space-y-2 pt-2">
          <button
            onClick={onPlaceOrder}
            className="w-full py-4 bg-[#C2185B] hover:bg-[#A9134C] text-white font-black text-sm uppercase tracking-wider rounded-full shadow-lg shadow-rose-300/60 flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>
              {t("summary.placeOrder")} • {formatLKR(finalTotal)}
            </span>
          </button>

          <p className="text-[10px] text-center text-slate-400 font-medium">
            By placing your order, you agree to SRIBEES{" "}
            <a href="#" className="underline hover:text-slate-600">
              Terms of Service
            </a>
          </p>
        </div>

        {/* 3 Guarantee Badges Box */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-[10px] font-extrabold text-slate-700">
          <div className="space-y-1 p-2 bg-slate-50 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-rose-100 text-[#D81B60] flex items-center justify-center mx-auto">
              🛡️
            </div>
            <div>{t("sidebar.freshGuarantee")}</div>
          </div>

          <div className="space-y-1 p-2 bg-slate-50 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              🤝
            </div>
            <div>{t("sidebar.contactless")}</div>
          </div>

          <div className="space-y-1 p-2 bg-slate-50 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              💬
            </div>
            <div>{t("sidebar.liveTrack")}</div>
          </div>
        </div>
      </div>

      {/* Customer Support Bottom Box */}
      <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-rose-100 text-[#D81B60] flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">
              {t("sidebar.needHelp")}
            </h4>
            <p className="text-[11px] text-slate-500 font-semibold">
              Hotline:{" "}
              <strong className="text-slate-800">+94 11 234 5678</strong>
            </p>
          </div>
        </div>

        <button className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-extrabold text-xs rounded-full shadow-2xs transition-colors cursor-pointer">
          {t("sidebar.chat")}
        </button>
      </div>

      {/* Available Coupons Modal */}
      <AvailableCouponsModal
        isOpen={isCouponsModalOpen}
        onClose={() => setIsCouponsModalOpen(false)}
        onUseCoupon={handleSelectCoupon}
        appliedCoupon={appliedCoupon}
      />
    </div>
  );
};
