import React from "react";
import { CompanyHeader } from "./components/layout/CompanyHeader";
import { CompanyFooter } from "./components/layout/CompanyFooter";
import { StickyShopBar } from "./components/layout/StickyShopBar";
import { DownloadAppModal } from "./components/modals/DownloadAppModal";

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 selection:bg-[#D81B60] selection:text-white">
      <CompanyHeader />
      <main id="main-content" className="flex-grow">
        {children}
      </main>
      <CompanyFooter />
      <StickyShopBar />
      <DownloadAppModal />
    </div>
  );
}
