"use client";

/**
 * Renders nothing: logs which store page is on show, for how long and how far
 * it was scrolled, plus products opened and searches made (src/lib/activity.ts).
 */
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  flushActivity,
  logActivity,
  pageHidden,
  pageScrolled,
  pageShown,
  startActivity,
} from "@/lib/activity";
import { pageName } from "@/utils/activityPages";

export function WebActivity() {
  const pathname = usePathname();
  const params = useSearchParams();
  const query = params.toString();

  // Timer, scroll, tab hidden/closed: once per tab.
  useEffect(() => {
    const stop = startActivity();
    let scrollQueued = false;
    const onScroll = () => {
      if (scrollQueued) return;
      scrollQueued = true;
      window.requestAnimationFrame(() => {
        scrollQueued = false;
        pageScrolled();
      });
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        pageHidden();
        logActivity("app_background");
        flushActivity();
      } else {
        logActivity("app_open");
        const p = new URLSearchParams(window.location.search);
        pageShown(pageName(window.location.pathname, p));
      }
    };
    const onPageHide = () => {
      pageHidden();
      flushActivity();
    };
    logActivity("app_open", { props: { referrer: document.referrer ? new URL(document.referrer).hostname : null } });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      stop();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  // Each page (and each search / product) as the shopper moves.
  useEffect(() => {
    const p = new URLSearchParams(query);
    const name = pageName(pathname, p);
    pageShown(name);
    if (pathname === "/productView" && p.get("id")) {
      logActivity("product_view", { productId: p.get("id"), props: { source: document.referrer ? "link" : "list" } });
    }
    const search = p.get("search") ?? p.get("q");
    if (pathname === "/product" && search && search.trim().length >= 2) {
      logActivity("search", { screen: name, props: { query: search.trim() } });
    }
    const category = p.get("category");
    if (pathname === "/product" && category && !search) {
      logActivity("category_open", { props: { name: category } });
    }
  }, [pathname, query]);

  return null;
}
