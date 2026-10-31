"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { STORE_URLS } from "../../companyContent";
import { useCompanyDialog } from "./useCompanyDialog";

export function DownloadAppModal() {
  const { isOpen, close, onBackdropClick } = useCompanyDialog("download");

  if (!isOpen) return null;

  return (
    <div
      onClick={onBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-pink-100 p-5 sm:p-7 lg:p-8 overflow-hidden my-auto">
        <button
          type="button"
          onClick={close}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 p-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#D81B60]/50 z-20 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <h2
          id="download-modal-title"
          className="text-center mb-4 sm:mb-6 text-2xl sm:text-3xl font-black tracking-tight leading-none uppercase text-zinc-800"
        >
          <span className="text-[#D81B60]">Download</span> our{" "}
          <span className="text-[#D81B60]">Mobile App</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          <div className="sm:col-span-6 flex justify-center">
            <Image
              src="/company/mockup.png"
              alt="SRIBEES mobile app"
              width={500}
              height={500}
              sizes="(max-width: 640px) 70vw, 300px"
              className="w-56 sm:w-full h-auto object-contain"
            />
          </div>

          <div className="sm:col-span-6 flex flex-col gap-3">
            <a
              href={STORE_URLS.playStore}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 hover:bg-black text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-md transition-colors"
            >
              <Image src="/base/playstore.png" alt="" width={24} height={24} className="w-6 h-6 object-contain" />
              <span className="text-left">
                <span className="block text-[9px] uppercase text-zinc-400 font-semibold tracking-wider leading-none">
                  GET IT ON
                </span>
                <span className="block text-sm font-bold tracking-tight leading-tight mt-0.5">
                  Google Play
                </span>
              </span>
            </a>

            <a
              href={STORE_URLS.appStore}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-900 hover:bg-black text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-md transition-colors"
            >
              <Image src="/base/appstore.png" alt="" width={24} height={24} className="w-6 h-6 object-contain" />
              <span className="text-left">
                <span className="block text-[9px] uppercase text-zinc-400 font-semibold tracking-wider leading-none">
                  Download on the
                </span>
                <span className="block text-sm font-bold tracking-tight leading-tight mt-0.5">
                  App Store
                </span>
              </span>
            </a>

            <Link
              href={ROUTES.HOME}
              onClick={close}
              className="bg-[#D81B60] hover:bg-[#C2185B] text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-md transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              <span className="text-left">
                <span className="block text-[9px] uppercase text-pink-100 font-semibold tracking-wider leading-none">
                  No download needed
                </span>
                <span className="block text-sm font-bold tracking-tight leading-tight mt-0.5">
                  Shop on the web
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
