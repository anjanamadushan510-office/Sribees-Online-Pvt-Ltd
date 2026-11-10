import type { Metadata } from "next";
import React from "react";
import { Providers } from "./providers";
import { getAppLocale, getAppMessages } from "@/i18n/server";
import { AppIntlProvider } from "@/components/AppIntlProvider";
import { MobileAppInstallBanner } from "@/components/MobileAppInstallBanner";
import { TopHeader } from "@/components/TopHeader";
import { MainNavbar } from "@/components/MainNavbar";
import { CategoryNav } from "@/components/CategoryNav";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { LoginModal } from "@/app/(shop)/home/components/LoginModal";
import { CouponSpotlightModal } from "@/components/coupons/CouponSpotlightModal";

export const metadata: Metadata = {
  title: "SRIBEES Online | Smart Grocery Hub",
  description:
    "Sri Lanka's leading online grocery store. Order fresh produce, dairy, seafood, tea, and daily essentials delivered fast via SriBees Express.",
};

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getAppLocale();
  const messages = await getAppMessages(locale);

  return (
    <AppIntlProvider locale={locale} messages={messages}>
      <Providers>
        <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-rose-100 selection:text-[#D81B60]">
          <MobileAppInstallBanner />
          <TopHeader />
          <MainNavbar />
          <CategoryNav />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
          <CartDrawer />
          <QuickViewModal />
          <LoginModal />
          <CouponSpotlightModal />
        </div>
      </Providers>
    </AppIntlProvider>
  );
}
