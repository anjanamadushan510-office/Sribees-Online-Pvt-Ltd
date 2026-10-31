"use client";

import React from "react";
import { Modal } from "@/components/base/Modal";
import {
  ShieldCheck,
  Check,
  MessageSquare,
  ArrowLeft,
  HelpCircle,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatLKR } from "@/utils/formatCurrency";

export interface SnapshotItem {
  id: string;
  title: string;
  subtitle: string;
  quantity: number;
  image: string;
}

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber?: string;
  totalAmount?: number;
  paymentMethod?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  items?: SnapshotItem[];
}

const DEFAULT_SNAPSHOT_ITEMS: SnapshotItem[] = [
  {
    id: "snap-1",
    title: "Nuwara Eliya Strawberries",
    subtitle: "250g pack",
    quantity: 2,
    image:
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "snap-2",
    title: "Highland Pure Milk",
    subtitle: "1L fresh carton",
    quantity: 2,
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "snap-3",
    title: "Organic Red Rice",
    subtitle: "2kg heirloom pack",
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "snap-4",
    title: "Dilmah Ceylon Tea",
    subtitle: "200g foil tin",
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=400&q=80",
  },
];

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderNumber = "SRB-98421",
  totalAmount = 3566,
  paymentMethod = "SRIBEES Cash Wallet + Card",
  customerName = "Tharushi Perera",
  customerPhone = "+94 77 123 4567",
  deliveryAddress = "42/3 Alfred House Gardens, Colombo 03",
  items = DEFAULT_SNAPSHOT_ITEMS,
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-3xl">
      {/* Container with negative margins to let header stretch edge-to-edge */}
      <div className="-m-4 sm:-m-6 relative">
        {/* TOP MAGENTA HEADER BANNER WITH CONFETTI DECORATIONS */}
        <div className="relative bg-gradient-to-r from-[#AD1457] via-[#D81B60] to-[#C2185B] p-6 sm:p-8 text-white overflow-hidden">
          {/* Top Right Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer backdrop-blur-xs"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 space-y-3">
            {/* Top Pill Badge */}
            {/*             <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 text-white font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Payment Confirmed & Dispatched</span>
            </div> */}

            {/* Checkmark Circle + Main Title */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
              <div className="w-14 h-14 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-xl shrink-0 ring-4 ring-white/30">
                <Check className="w-8 h-8 stroke-3" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  Order Placed Successfully!
                </h1>
                <p className="text-xs sm:text-sm text-rose-50/95 font-medium mt-1 max-w-xl leading-relaxed">
                  Thank you for shopping with SRIBEES Online!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-7 space-y-5 bg-white">
          {/* Green SMS & WhatsApp Status Banner */}
          {/*           <div className="bg-emerald-50/90 border border-emerald-200/70 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <p className="text-xs text-emerald-900 font-semibold leading-snug">
              Order status SMS sent to <strong className="font-extrabold text-emerald-950">{customerPhone}</strong> & live WhatsApp dispatch updates enabled.
            </p>
          </div> */}

          {/* Delivery Address & Payment Confirmed Card */}
          <div className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4">
            {/* Delivery Address */}
            <div className="space-y-1">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span>📍 Delivery Address</span>
                <span>•</span>
                <span className="text-slate-600">Home (Primary)</span>
              </div>
              <div className="text-sm font-black text-slate-900">
                {customerName}
              </div>
              <div className="text-xs text-slate-600 font-medium">
                {deliveryAddress}
              </div>
            </div>

            {/* Payment Confirmed */}
            <div className="text-left sm:text-right space-y-0.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Payment Confirmed
              </div>
              <div className="text-lg sm:text-xl font-black text-[#D81B60]">
                {formatLKR(totalAmount)}
              </div>
              <div className="text-xs font-extrabold text-pink-700">
                {paymentMethod}
              </div>
            </div>
          </div>

          {/* Items Snapshot Section */}
          {/*           <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Items Snapshot</span>
              <span className="text-xs text-slate-400 font-medium">
                ({items.length} fresh{" "}
                {items.length === 1 ? "grocery" : "groceries"})
              </span>
            </h3> */}

          {/* Grid of 4 Items */}
          {/*             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 border border-slate-200/70 rounded-2xl p-2.5 flex flex-col justify-between space-y-2 hover:border-rose-200 transition-colors"
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white border border-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 bg-[#D81B60] text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                      {item.quantity}x
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* Footer Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#D81B60] hover:bg-[#B7154E] text-white text-xs font-black rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>View Order in Order History</span>
            </button>
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
