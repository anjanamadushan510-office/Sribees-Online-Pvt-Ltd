import React from 'react';
import { Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const ExpressSlotBanner: React.FC = () => {
  const t = useTranslations("product");

  return (
    <div className="bg-rose-50/90 border border-rose-200/80 rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shadow-xs">
      <div className="flex items-center gap-3 text-center sm:text-left">
        <div className="w-10 h-10 rounded-xl bg-[#D81B60] text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-200">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
            {t("expressBanner.title")}
          </h3>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">
            {t("expressBanner.desc")}
          </p>
        </div>
      </div>

      <button className="px-4 py-2 bg-[#D81B60] hover:bg-[#C2185B] text-white font-black text-xs rounded-full shadow-md shadow-rose-200 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap">
        Live Dispatch Active
      </button>
    </div>
  );
};
