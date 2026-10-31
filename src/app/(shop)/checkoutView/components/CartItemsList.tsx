"use client";

import React from "react";
import { CartItemCard, CheckoutCartItem } from "./CartItemCard";
import { Leaf } from "lucide-react";

interface CartItemsListProps {
  items: CheckoutCartItem[];
  onUpdateQuantity?: (id: string, qty: number) => void;
  onRemoveItem?: (id: string) => void;
  onClearAll?: () => void;
  onToggleSaveForLater?: (id: string) => void;
}

export const CartItemsList: React.FC<CartItemsListProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onToggleSaveForLater,
}) => {
  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-1.5">
          <span>Items for Delivery</span>
          <span className="text-xs text-slate-400 font-medium">
            (Dispatched together)
          </span>
        </h2>
      </div>

      {/* Cart Items List */}
      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-[#D81B60] flex items-center justify-center mx-auto">
            <Leaf className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">
            Your cart is empty
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add some fresh Nuwara Eliya strawberries, dairy, organic rice, or
            Ceylon tea to continue checkout.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
            />
          ))}
        </div>
      )}
    </div>
  );
};
