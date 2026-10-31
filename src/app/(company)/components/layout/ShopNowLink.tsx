import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface ShopNowLinkProps {
  label?: string;
  className?: string;
}

/** The one primary action of the company site: open the store. */
export function ShopNowLink({ label = "Shop Now", className = "" }: ShopNowLinkProps) {
  return (
    <Link
      href={ROUTES.HOME}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#D81B60] hover:bg-[#C2185B] text-white font-bold shadow-lg shadow-[#D81B60]/30 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#D81B60] whitespace-nowrap ${className}`}
    >
      <ShoppingBag className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  );
}
