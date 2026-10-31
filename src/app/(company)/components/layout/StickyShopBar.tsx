"use client";

import { useEffect, useState } from "react";
import { ShopNowLink } from "./ShopNowLink";

const SHOW_AFTER_SCROLL_PX = 480;

/** Phones only: keeps the store one thumb away once the header CTA has scrolled by. */
export function StickyShopBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_SCROLL_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={`sm:hidden fixed bottom-0 inset-x-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white/90 backdrop-blur-md border-t border-zinc-200 transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <ShopNowLink label="Shop groceries online" className="w-full text-sm py-3" />
    </div>
  );
}
