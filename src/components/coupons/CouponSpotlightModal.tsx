"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import { couponService } from "@/api/services/coupon.service";
import { CouponSpotlight } from "@/interfaces/coupon.interface";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthStore } from "@/state/auth.store";
import { useToastStore } from "@/state/toast.store";
import { CouponCountdown, CouponNewBadge } from "./CouponCountdown";

/** Pages where an offers popup would get in the way of finishing an order. */
const QUIET_PATHS = ["/checkoutView", "/promotions"];

/**
 * The "special offers" popup on opening the store, as in the app.
 *
 * The server decides whether to show it (`show`, once a day per customer)
 * and words it; this asks on load, on sign-in and when the tab comes back.
 * "Collect & shop" saves every listed coupon and opens the coupons section.
 */
export const CouponSpotlightModal: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();
  const [spotlight, setSpotlight] = useState<CouponSpotlight | null>(null);
  const [busy, setBusy] = useState(false);
  const asking = useRef(false);

  const quiet = QUIET_PATHS.some((p) => pathname?.startsWith(p));

  const ask = useCallback(async () => {
    if (!isAuthenticated || quiet || asking.current || spotlight) return;
    asking.current = true;
    try {
      const data = await couponService.getSpotlight();
      if (data.show && data.coupons.length > 0) {
        setSpotlight(data);
        couponService
          .markSpotlightSeen(data.coupons.map((c) => c.coupon_id))
          .catch(() => {});
      }
    } catch {
      // No popup is the right answer to a failed check.
    } finally {
      asking.current = false;
    }
  }, [isAuthenticated, quiet, spotlight]);

  useEffect(() => {
    const first = setTimeout(ask, 1500);
    const onVisible = () => {
      if (document.visibilityState === "visible") ask();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(first);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ask]);

  useEffect(() => {
    if (!spotlight) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSpotlight(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spotlight]);

  if (!spotlight) return null;

  const collectAndShop = async () => {
    setBusy(true);
    try {
      const message = await couponService.collectMany(spotlight.coupons.map((c) => c.code));
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EVALUATE_COUPONS] });
      if (message) addToast({ title: spotlight.title ?? "", message, type: "success" });
    } catch {
      // The coupons page still lets them collect one by one.
    } finally {
      setBusy(false);
      setSpotlight(null);
      router.push("/promotions#coupons-section");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 px-4"
      onClick={() => setSpotlight(null)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="coupon-spotlight-title"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setSpotlight(null)}
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center cursor-pointer hover:bg-slate-50"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-700" />
        </button>

        <div className="rounded-t-3xl bg-gradient-to-b from-rose-100 to-white px-6 pt-6 pb-3 text-center">
          <h2 id="coupon-spotlight-title" className="text-xl font-black text-[#D81B60]">
            {spotlight.title}
          </h2>
        </div>

        <div className="max-h-[50vh] overflow-y-auto px-5 space-y-3">
          {spotlight.coupons.map((c) => (
            <div
              key={c.coupon_id}
              className="flex rounded-xl border border-rose-200/70 bg-rose-50/50 overflow-hidden"
            >
              <div className="w-28 shrink-0 flex items-center justify-center px-2 py-4 text-center">
                <span className="text-xl font-black leading-tight text-[#E5480B]">{c.label}</span>
              </div>
              <div className="border-l border-dashed border-rose-300 my-2" aria-hidden />
              <div className="flex-1 min-w-0 p-3 space-y-1">
                {c.badge && <CouponNewBadge text={c.badge} />}
                <p className="text-sm font-black text-slate-900 truncate">
                  {c.description || c.code}
                </p>
                {c.terms && c.terms[0] && (
                  <p className="text-[11px] text-slate-500 truncate">{c.terms[0]}</p>
                )}
                {c.expiry && <CouponCountdown expiry={c.expiry} compact />}
              </div>
            </div>
          ))}
        </div>

        <div className="p-5">
          <button
            type="button"
            onClick={collectAndShop}
            disabled={busy}
            className="w-full h-12 rounded-full bg-[#D81B60] hover:bg-[#C2185B] text-white text-base font-black cursor-pointer disabled:opacity-70 flex items-center justify-center"
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : spotlight.button}
          </button>
        </div>
      </div>
    </div>
  );
};
