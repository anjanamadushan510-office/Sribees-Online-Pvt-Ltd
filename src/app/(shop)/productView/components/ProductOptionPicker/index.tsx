"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ProductOption } from "@/interfaces/product.interface";

interface ProductOptionPickerProps {
  /** "Shade" / "Colour" as the server names it. */
  label: string;
  options: ProductOption[];
  selectedId: string | null;
  /** The product's own photo, for a shade without one. */
  fallbackImage?: string;
  onSelect: (option: ProductOption) => void;
}

/** "Shade" -> the word in the shopper's language, else the server's own label. */
export const useOptionWord = (label: string | null | undefined): string => {
  const t = useTranslations("product");
  const key = (label || "option").toLowerCase();
  return t.has(`details.optionWords.${key}`)
    ? t(`details.optionWords.${key}`)
    : label || t("details.optionWords.option");
};

/**
 * The shades / colours of a product with options (backend migration 123): a
 * photo chip per shade. Nothing is picked for the shopper; a sold-out shade is
 * greyed and cannot be picked.
 */
export const ProductOptionPicker: React.FC<ProductOptionPickerProps> = ({
  label,
  options,
  selectedId,
  fallbackImage,
  onSelect,
}) => {
  const t = useTranslations("product");
  const word = useOptionWord(label);
  const picked = options.find((o) => o.variant_id === selectedId) || null;

  return (
    <div className="space-y-2.5" data-testid="option-picker">
      <p
        className={`text-xs font-semibold uppercase tracking-wider ${
          picked ? "text-slate-500" : "text-[#D81B60]"
        }`}
      >
        {picked
          ? t("details.optionPicked", { label: word, name: picked.name })
          : t("details.chooseOption", { label: word })}
      </p>
      <div role="radiogroup" aria-label={t("details.chooseOption", { label: word })} className="flex flex-wrap gap-2">
        {options.map((o) => {
          const soldOut = o.available != null && o.available <= 0;
          const selected = o.variant_id === selectedId;
          const photo = o.image_url || fallbackImage;
          return (
            <button
              key={o.variant_id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-disabled={soldOut}
              title={soldOut ? t("details.optionSoldOut", { name: o.name }) : o.name}
              onClick={() => !soldOut && onSelect(o)}
              className={`w-20 p-1.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all focus-visible:outline-2 focus-visible:outline-[#D81B60] ${
                selected
                  ? "border-[#D81B60] bg-rose-50/60"
                  : "border-transparent bg-slate-50 hover:border-rose-200"
              } ${soldOut ? "opacity-45 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span className="w-16 h-16 rounded-lg bg-white overflow-hidden flex items-center justify-center">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={o.name} className="w-full h-full object-contain" />
                ) : null}
              </span>
              <span
                className={`text-xs font-semibold text-center leading-tight line-clamp-2 ${
                  selected ? "text-[#B01550]" : "text-slate-800"
                } ${soldOut ? "line-through" : ""}`}
              >
                {o.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
