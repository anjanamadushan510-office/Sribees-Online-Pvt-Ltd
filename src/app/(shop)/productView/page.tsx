"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductGallery } from "./components/ProductGallery";
import { ProductDetailsInfo } from "./components/ProductDetailsInfo";
import { ProductFarmStoryTabs } from "./components/ProductFarmStoryTabs";
import { RelatedProducts } from "./components/RelatedProducts";
import { useProducts, useProductById } from "@/api/queries/useProducts";
import { Skeleton } from "@/components/base/Skeleton";
import { Breadcrumb } from "@/components/Breadcumb";
import { ProductVariant } from "@/interfaces/product.interface";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { useTranslations } from "next-intl";

function ProductViewContent() {
  const t = useTranslations("product");
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("id") || "";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [productId]);

  const {
    data: product,
    isLoading: productLoading,
    isError,
  } = useProductById(productId);
  const { data: allProducts } = useProducts();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );

  if (productLoading) {
    return (
      <main className="flex-1 max-w-350 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb
          items={[
            { label: t("details.shop"), href: "/product" },
            { label: t("details.loading"), isCurrent: true },
          ]}
          className="mb-6"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200">
          <Skeleton className="w-full aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-48 h-8" />
            <Skeleton className="w-full h-24 rounded-2xl" />
            <Skeleton className="w-full h-12 rounded-full" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="flex-1 max-w-350 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb
          items={[
            { label: t("details.shop"), href: "/product" },
            { label: t("details.productNotFound"), isCurrent: true },
          ]}
          className="mb-6"
        />
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-[#D81B60] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {t("details.productNotFound")}
          </h2>
          <p className="text-xs font-medium text-slate-500 max-w-md mx-auto">
            {t("details.notFoundDesc")}
          </p>
          <button
            onClick={() => router.push("/product")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D81B60] text-white text-xs font-black rounded-full shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("details.backToCatalog")}
          </button>
        </div>
      </main>
    );
  }

  const categoryLabel: string = product.category || t("details.shop");

  return (
    <main className="flex-1 max-w-350 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: t("details.shop"), href: "/product" },
          { label: categoryLabel, href: "/product" },
          {
            label: product.title || product.name || t("details.productDetails"),
            isCurrent: true,
          },
        ]}
        className="mb-6"
      />

      <div className="space-y-10">
        {/* Top Product Hero: Gallery on Left, Details Info on Right */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <ProductGallery
            product={product}
            selectedImage={selectedVariant?.image_url}
          />
          <ProductDetailsInfo
            product={product}
            onVariantChange={(variant) => setSelectedVariant(variant)}
          />
        </div>

        {/* Middle Section: Description & Specifications Tabs */}
        <ProductFarmStoryTabs product={product} />

        {/* Bottom Section: Related Products */}
        <RelatedProducts
          products={allProducts || []}
          currentProductId={product.id || product.product_id}
        />
      </div>
    </main>
  );
}

export default function ProductView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-8 bg-slate-50 flex items-center justify-center">
          <div className="space-y-4 w-full max-w-4xl">
            <Skeleton className="w-full h-12 rounded-2xl" />
            <Skeleton className="w-full h-96 rounded-3xl" />
          </div>
        </div>
      }
    >
      <ProductViewContent />
    </Suspense>
  );
}
