"use client";

import { useState } from "react";
import { ArrowRight, Calculator, X } from "lucide-react";
import { AFFILIATE_PORTAL_URL } from "../../companyContent";
import { useCompanyDialog } from "../modals/useCompanyDialog";

const RATES = [
  { value: 0.02, label: "2.0% Standard Tier" },
  { value: 0.03, label: "3.0% VIP Partner" },
];

const formatRupees = (amount: number) => `Rs. ${Math.round(amount).toLocaleString("en-US")}`;

export function EarningsCalculatorModal() {
  const { isOpen, close, onBackdropClick } = useCompanyDialog("calculator");
  const [customers, setCustomers] = useState(50);
  const [spend, setSpend] = useState(25000);
  const [rate, setRate] = useState(RATES[0].value);

  if (!isOpen) return null;

  const totalVolume = customers * spend;

  return (
    <div
      onClick={onBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calc-modal-title"
    >
      <div className="relative w-full max-w-lg mx-auto my-auto bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
        <button
          type="button"
          onClick={close}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors focus:outline-none cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-[#D81B60] text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            EARNINGS ESTIMATOR
          </div>
          <h3 id="calc-modal-title" className="text-2xl font-black text-slate-900">
            Calculate Your Partner Earnings
          </h3>
          <p className="text-sm text-slate-500 font-normal">
            Estimate how much recurring lifetime income you can earn based on active buyers you refer.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-3 text-sm font-semibold">
              <label htmlFor="customers-slider" className="text-slate-700">
                Referred Active Monthly Customers:
              </label>
              <span className="text-[#D81B60] font-extrabold text-base whitespace-nowrap">{customers} buyers</span>
            </div>
            <input
              type="range"
              id="customers-slider"
              min={5}
              max={500}
              step={5}
              value={customers}
              onChange={(event) => setCustomers(Number(event.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#D81B60]"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center gap-3 text-sm font-semibold">
              <label htmlFor="spend-slider" className="text-slate-700">
                Avg. Monthly Grocery Order / Customer:
              </label>
              <span className="text-[#D81B60] font-extrabold text-base whitespace-nowrap">{formatRupees(spend)}</span>
            </div>
            <input
              type="range"
              id="spend-slider"
              min={5000}
              max={100000}
              step={2500}
              value={spend}
              onChange={(event) => setSpend(Number(event.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#D81B60]"
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 block">Commission Tier Rate:</span>
            <div className="grid grid-cols-2 gap-3">
              {RATES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={rate === option.value}
                  onClick={() => setRate(option.value)}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                    rate === option.value
                      ? "border-pink-500 bg-pink-50 text-[#D81B60] shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-pink-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-zinc-950 text-white space-y-2 border border-slate-800 shadow-xl">
            <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              Estimated Monthly Income
            </div>
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-pink-300">
              {formatRupees(totalVolume * rate)} / mo
            </div>
            <div className="text-[11px] text-zinc-400 font-normal">
              Based on Total Network Order Volume of{" "}
              <span className="text-white font-medium">{formatRupees(totalVolume)}</span>.
            </div>
          </div>
        </div>

        <a
          href={AFFILIATE_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-gradient-to-r from-[#D81B60] to-pink-600 hover:from-pink-600 hover:to-[#C2185B] text-white font-bold text-sm shadow-md shadow-[#D81B60]/30 transition-all"
        >
          Join Partner Program Now
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
