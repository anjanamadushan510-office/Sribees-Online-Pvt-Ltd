"use client";

import React from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export interface BreadcrumbItem {
  /** The text label for the breadcrumb item */
  label: string;
  /** Navigation target URL. If omitted or item is last, renders as current page text */
  href?: string;
  /** Optional icon component to render before label */
  icon?: React.ComponentType<{ className?: string }>;
  /** Explicitly mark item as active current page */
  isCurrent?: boolean;
}

export interface BreadcrumbProps {
  /** List of breadcrumb items (excluding Home unless showHome is false) */
  items: BreadcrumbItem[];
  /** Whether to automatically prepend a Home item. Default: true */
  showHome?: boolean;
  /** Custom Home link target URL. Default: ROUTES.HOME */
  homeHref?: string;
  /** Custom Home label text. Default: 'Home' */
  homeLabel?: string;
  /** Additional container CSS classes */
  className?: string;
  /** Custom separator icon or element between items */
  separator?: React.ReactNode;
  /** Generate SEO Schema.org JSON-LD structured data. Default: true */
  jsonLd?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  showHome = true,
  homeHref = ROUTES.HOME || "/",
  homeLabel = "Home",
  className = "",
  separator = <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />,
  jsonLd = true,
}) => {
  // Combine Home item if showHome is enabled
  const allItems: BreadcrumbItem[] = showHome
    ? [
        {
          label: homeLabel,
          href: homeHref,
          icon: Home,
        },
        ...items,
      ]
    : items;

  if (!allItems || allItems.length === 0) return null;

  // Prepare Schema.org JSON-LD payload for SEO Google Rich Snippets
  const schemaItems = allItems.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    item: item.href ? item.href : undefined,
  }));

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: schemaItems,
  };

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdData).replace(/</g, "\\u003c"),
          }}
        />
      )}

      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-1.5 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap pb-1.5 scrollbar-none ${className}`}
      >
        <ol className="flex items-center gap-1.5 list-none m-0 p-0">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const isCurrentItem = item.isCurrent ?? isLast;
            const Icon = item.icon;

            return (
              <li key={index} className="inline-flex items-center gap-1.5">
                {index > 0 && <span aria-hidden="true">{separator}</span>}

                {isCurrentItem || !item.href ? (
                  <span
                    aria-current={isCurrentItem ? "page" : undefined}
                    className="flex items-center gap-1 text-slate-900 font-extrabold max-w-[200px] sm:max-w-xs truncate"
                    title={item.label}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                    <span>{item.label}</span>
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 text-slate-500 hover:text-[#D81B60] transition-colors"
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export const Breadcumb = Breadcrumb;
export default Breadcrumb;
