"use client";

import React from "react";
import { Category } from "@/interfaces/category.interface";
import { ArrowRight, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/state/ui.store";
import { ROUTES } from "@/constants/routes";
import { formatImageUrl, DEFAULT_FALLBACK_IMAGE } from "@/utils/formatImageUrl";

interface FeaturedCategoriesProps {
  categories: Category[];
}

export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ categories }) => {
  const router = useRouter();
  const { setActiveFilterCategory } = useUIStore();

  const handleSelectCategory = (cat: Category) => {
    const catId = cat.category_id || cat.id;
    const catTitle = cat.title || cat.name || "";
    setActiveFilterCategory(catTitle);
    const query = new URLSearchParams();
    if (catId) query.set("category_id", catId);
    if (catTitle) query.set("category", catTitle);
    router.push(`${ROUTES.PRODUCTS}?${query.toString()}`);
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div className="mb-12 space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-rose-100 text-[#D81B60]">
          <Flame className="w-4 h-4 fill-[#D81B60]" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Featured Departments
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Hand-curated top categories with daily express delivery
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleSelectCategory(cat)}
            className="group relative bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-[#D81B60] hover:shadow-xl hover:shadow-rose-100/50 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Background ambient gradient on hover */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div>
              {/* Image & Badge Header */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-100">
                <img
                  src={formatImageUrl(cat.image || cat.image_url)}
                  alt={cat.title}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target.src !== DEFAULT_FALLBACK_IMAGE) {
                      target.src = DEFAULT_FALLBACK_IMAGE;
                    }
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {cat.tag && (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-slate-900/90 text-white text-[10px] font-black tracking-wider uppercase rounded-md backdrop-blur-sm border border-white/10">
                    {cat.tag}
                  </span>
                )}
                <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-white/95 text-[#D81B60] text-[11px] font-black rounded-full shadow-sm">
                  {cat.itemCount}+ Items
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-lg font-black text-slate-900 group-hover:text-[#D81B60] transition-colors leading-tight">
                {cat.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                {cat.description || cat.subtitle}
              </p>

              {/* Subcategories Tags preview */}
              {cat.subcategories && cat.subcategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  {cat.subcategories.slice(0, 3).map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 group-hover:bg-rose-50 group-hover:text-[#D81B60] text-slate-600 text-[11px] font-bold rounded-md transition-colors"
                    >
                      {sub}
                    </span>
                  ))}
                  {cat.subcategories.length > 3 && (
                    <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-md">
                      +{cat.subcategories.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#D81B60] group-hover:text-[#C2185B]">
              <span>Explore Products</span>
              <div className="w-7 h-7 rounded-full bg-rose-50 group-hover:bg-[#D81B60] group-hover:text-white flex items-center justify-center transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
