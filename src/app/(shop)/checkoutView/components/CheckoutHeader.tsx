import React from "react";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Breadcrumb } from "@/components/Breadcumb";

interface CheckoutHeaderProps {
  itemCount: number;
}

export const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({
  itemCount,
}) => {
  const t = useTranslations("checkout");

  return (
    <div className="mb-6 space-y-4">
      {/* Top Bar: Breadcrumb + Fulfillment Hub */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pb-2 border-b border-slate-100">
        <Breadcrumb
          items={[
            { label: "Shop", href: "/product" },
            { label: t("header.title"), isCurrent: true },
          ]}
        />
      </div>

      {/* Main Title Section */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-black tracking-wider text-[#D81B60] uppercase bg-rose-50 px-2.5 py-1 rounded-md">
            <ShoppingBag className="w-4 h-4" />
            <span>Fast, Fresh & Guaranteed</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t("header.title")}
        </h1>
        <span className="bg-rose-100 text-[#D81B60] font-black text-xs px-3 py-1 rounded-full">
          {itemCount} {t("cartItems.title")}
        </span>
      </div>
    </div>
  );
};
