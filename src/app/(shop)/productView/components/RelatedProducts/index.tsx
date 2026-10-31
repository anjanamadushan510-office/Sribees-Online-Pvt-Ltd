"use client";

import React from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { Product } from "@/interfaces/product.interface";

import { useTranslations } from "next-intl";

interface RelatedProductsProps {
  products: Product[];
  currentProductId?: string;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  products,
  currentProductId,
}) => {
  const t = useTranslations("product");
  const relatedItems = products
    .filter((p) => (p.id || p.product_id) !== currentProductId)
    .slice(0, 5);

  if (relatedItems.length === 0) return null;

  return (
    <section className="w-full mt-10 pt-6 border-t border-slate-200/80 font-sans">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[#D81B60]">
            {t("details.exploreMore")}
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight mt-0.5">
            {t("details.related")}
          </h2>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {relatedItems.map((prod) => (
          <ProductCard key={prod.id || prod.product_id} product={prod} />
        ))}
      </div>
    </section>
  );
};
