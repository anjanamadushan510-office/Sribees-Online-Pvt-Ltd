"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants/routes";

export const CategoryNav: React.FC = () => {
  const pathname = usePathname();
  const t = useTranslations("common.categoryNav");

  const navItems = [
    { label: t("home"), href: ROUTES.HOME },
    { label: t("shop"), href: ROUTES.SHOP },
    { label: t("categories"), href: ROUTES.CATEGORIES },
    { label: t("promotions"), href: ROUTES.PROMOTIONS },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 hidden md:block">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Category Menu Links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 text-xs font-semibold transition-all relative ${
                  isActive
                    ? "text-[#D81B60] font-bold border-b-2 border-[#D81B60]"
                    : "text-slate-600 hover:text-[#D81B60]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right Express Order Button */}
        <button className="flex items-center gap-1.5 text-xs font-bold text-[#D81B60] hover:text-[#C2185B] bg-rose-50/80 hover:bg-rose-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer">
          <Truck className="w-4 h-4 text-[#D81B60]" />
          <span>{t("trackOrder")}</span>
        </button>
      </div>
    </nav>
  );
};

export default CategoryNav;
