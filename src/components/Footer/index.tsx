"use client";

import React from "react";
import Link from "next/link";
import { Share2, Mail, ExternalLink } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { PLAYSTORE_LINK, SOCIAL_LINKS } from "@/constants/links";
import { useCategories } from "@/api/queries/useCategories";
import { useUIStore } from "@/state/ui.store";

export const Footer: React.FC = () => {
  const { data: categories, isLoading } = useCategories({
    top_level_only: true,
  });
  const { setActiveFilterCategory } = useUIStore();

  const displayedCategories = categories ? categories.slice(0, 8) : [];
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-end gap-2.5">
              <img
                src="/base/logo.png"
                alt="SRIBEES logo"
                className="h-9 w-auto object-contain"
              />
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="font-montserrat text-2xl font-black italic tracking-tight text-white">
                  SRIBEƎS
                </span>
                <span className="font-poppins text-base font-bold not-italic text-[#D81B60] tracking-tight">
                  Online
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
              Your modern smart grocery store connecting Sri Lanka&apos;s
              freshest produce with fast doorstep delivery via SriBees Express.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#D81B60] hover:text-white text-slate-400 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#D81B60] hover:text-white text-slate-400 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-[#D81B60] hover:text-white text-slate-400 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>

            {/* Mobile App Download Button */}
            <div className="pt-2">
              <span className="block text-[11px] text-slate-400 font-semibold mb-2 uppercase tracking-wider">
                Mobile App
              </span>
              <a
                href={PLAYSTORE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl transition-all shadow-xs group"
                title="Download SRIBEES on Google Play"
              >
                <img
                  src="/base/playstore.png"
                  alt="Google Play"
                  className="w-4 h-4 object-contain group-hover:scale-110 transition-transform"
                />
                <div className="text-left">
                  <span className="block text-[8px] font-semibold text-slate-400 uppercase leading-none">
                    GET IT ON
                  </span>
                  <span className="block text-xs font-bold text-white group-hover:text-rose-400 transition-colors leading-tight">
                    Google Play
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase text-white tracking-wider">
              Shop
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li>
                <Link
                  href={ROUTES.SHOP}
                  onClick={() => setActiveFilterCategory("All")}
                  className="hover:text-[#D81B60] transition-colors"
                >
                  All Products
                </Link>
              </li>

              {isLoading ? (
                <>
                  <li className="h-4 w-24 bg-slate-800 rounded animate-pulse my-1" />
                  <li className="h-4 w-20 bg-slate-800 rounded animate-pulse my-1" />
                  <li className="h-4 w-28 bg-slate-800 rounded animate-pulse my-1" />
                </>
              ) : displayedCategories.length > 0 ? (
                displayedCategories.map((category) => (
                  <li key={category.id || category.slug}>
                    <Link
                      href={`/product?category=${encodeURIComponent(category.title)}`}
                      onClick={() => setActiveFilterCategory(category.title)}
                      className="hover:text-[#D81B60] transition-colors block truncate"
                    >
                      {category.title}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link
                      href={ROUTES.CATEGORIES}
                      className="hover:text-[#D81B60] transition-colors"
                    >
                      Fresh Produce
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={ROUTES.CATEGORIES}
                      className="hover:text-[#D81B60] transition-colors"
                    >
                      Dairy & Eggs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={ROUTES.CATEGORIES}
                      className="hover:text-[#D81B60] transition-colors"
                    >
                      Meat & Seafood
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={ROUTES.CATEGORIES}
                      className="hover:text-[#D81B60] transition-colors"
                    >
                      Pantry Staples
                    </Link>
                  </li>
                </>
              )}

              {categories && categories.length > 8 && (
                <li>
                  <Link
                    href={ROUTES.CATEGORIES}
                    className="hover:text-[#D81B60] transition-colors text-rose-400 font-bold"
                  >
                    View All Categories
                  </Link>
                </li>
              )}

              <li>
                <Link
                  href={ROUTES.PROMOTIONS}
                  className="hover:text-[#D81B60] transition-colors"
                >
                  Deals & Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* SRIBEES Network */}
          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase text-white tracking-wider">
              SRIBEES Network
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-400">
              <li>
                <Link href={ROUTES.COMPANY} className="hover:text-[#D81B60] transition-colors">
                  About SRIBEES
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.BECOME_PARTNER}
                  className="hover:text-[#D81B60] transition-colors"
                >
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.ORDER_HISTORY}
                  className="hover:text-[#D81B60] transition-colors"
                >
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.PRIVACY_POLICY}
                  className="hover:text-[#D81B60] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.RETURN_POLICY}
                  className="hover:text-[#D81B60] transition-colors"
                >
                  Return &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.TERMS}
                  className="hover:text-[#D81B60] transition-colors"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <a
                  href={PLAYSTORE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#D81B60] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>SRIBEES Android App</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase text-white tracking-wider">
              Contact Us
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-slate-400">
              <Mail className="w-4 h-4 text-[#D81B60] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="block text-[11px] text-slate-500 font-medium">
                  Customer Support
                </span>
                <a
                  href={`mailto:${SOCIAL_LINKS.supportEmail}`}
                  className="text-white hover:text-[#D81B60] transition-colors font-bold break-all"
                >
                  {SOCIAL_LINKS.supportEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & payment methods */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500">
          <p>© 2026 SRIBEES Online. All rights reserved.</p>

          <div className="flex items-center gap-2 flex-wrap">
            <div
              title="Visa"
              className="h-7 px-2 bg-white rounded flex items-center justify-center shadow-sm"
            >
              <img
                src="/footer/visa.png"
                alt="Visa"
                className="h-3.5 w-auto object-contain"
              />
            </div>
            <div
              title="Mastercard"
              className="h-7 px-1.5 bg-white rounded flex items-center justify-center shadow-sm"
            >
              <img
                src="/footer/card.png"
                alt="Mastercard"
                className="h-5 w-auto object-contain"
              />
            </div>
            <div
              title="Cash on Delivery"
              className="h-7 px-2 bg-white rounded flex items-center justify-center shadow-sm"
            >
              <img
                src="/footer/cash-on-delivery.png"
                alt="Cash on Delivery"
                className="h-5 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
