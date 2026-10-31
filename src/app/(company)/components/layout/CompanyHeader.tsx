"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useCompanyUiStore } from "@/state/companyUi.store";
import { navLinks } from "../../companyContent";
import { ShopNowLink } from "./ShopNowLink";

export function CompanyHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const openModal = useCompanyUiStore((state) => state.openModal);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-3 sm:py-4 px-3 sm:px-6 lg:px-8">
      <div className="max-w-[88rem] mx-auto">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full pl-3.5 pr-2 sm:pl-6 sm:pr-3 py-2 flex items-center justify-between gap-2 shadow-2xl">
          <Link href={ROUTES.COMPANY} className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Image src="/base/logo.png" alt="" width={36} height={36} className="h-6 sm:h-9 w-auto object-contain" />
            <span className="flex items-baseline gap-1 whitespace-nowrap leading-none text-white">
              <span className="font-montserrat font-black italic tracking-tight text-base sm:text-2xl">SRIBEƎS</span>
              <span className="text-[10px] sm:text-base font-medium">Online</span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openModal("download")}
              className="hidden sm:inline-flex items-center rounded-full bg-white/15 hover:bg-white/25 border border-white/15 text-white text-sm font-medium px-4 py-2.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              Download App
            </button>
            <ShopNowLink className="text-xs sm:text-sm px-3.5 py-2 sm:px-5 sm:py-2.5" />
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="lg:hidden p-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden mt-2 bg-zinc-950/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-4 shadow-2xl flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-base font-medium text-white/90 hover:text-white hover:bg-white/10 py-2.5 px-4 rounded-xl transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openModal("download");
              }}
              className="sm:hidden text-left text-base font-medium text-white/90 hover:text-white hover:bg-white/10 py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
            >
              Download App
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
