"use client";

import React from "react";
import {
  X,
  Navigation,
  PhoneCall,
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  ShieldCheck,
  ExternalLink,
  Loader2,
  Key,
  FileText,
  ShoppingBag,
  Package,
  Home,
  UserCheck,
} from "lucide-react";
import {
  OrderRecord,
  ApiOrderStatusTimelineItem,
  OrderTrackingHistoryItem,
} from "@/interfaces/order.interface";
import { formatLKR } from "@/utils/formatCurrency";
import { useTrackOrder, useGetOrder } from "@/api/queries/useOrders";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useTranslations } from "next-intl";

interface OrderTrackingModalProps {
  order: OrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

// Helper to pick matching icon for timeline status
const getTimelineStepIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes("placed")) return ShoppingBag;
  if (l.includes("confirm")) return CheckCircle2;
  if (l.includes("prepar") || l.includes("process")) return Clock;
  if (l.includes("packed") || l.includes("packing")) return Package;
  if (l.includes("wait")) return Clock;
  if (l.includes("hand")) return UserCheck;
  if (l.includes("shipp") || l.includes("dispatch")) return Truck;
  if (l.includes("out") || l.includes("delivery")) return Navigation;
  if (l.includes("deliver")) return Home;
  return CheckCircle2;
};

// Date formatter matching screenshot format: "Oct 6, 2026 - 9:33 AM"
const formatStepTime = (dateStr?: string | null) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dateFormatted = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeFormatted = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${dateFormatted} - ${timeFormatted}`;
  } catch {
    return dateStr;
  }
};

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const t = useTranslations("orderHistory");
  useBodyScrollLock(isOpen);

  const getTranslatedStepLabel = (label: string) => {
    const l = (label || "").toLowerCase();
    if (l.includes("placed")) return t("status.orderPlaced");
    if (l.includes("confirm")) return t("status.confirmed");
    if (l.includes("prepar") || l.includes("process"))
      return t("status.preparingOrder");
    if (l.includes("packed") || l.includes("packing"))
      return t("status.packed");
    if (l.includes("wait")) return t("status.readyForPickup");
    if (l.includes("hand") || l.includes("shipp") || l.includes("dispatch"))
      return t("status.dispatched");
    if (l.includes("out") || l.includes("delivery"))
      return t("status.outForDelivery");
    if (l.includes("deliver")) return t("status.delivered");
    if (l.includes("cancel")) return t("status.cancelled");
    return label;
  };

  const targetId =
    order?.orderId || order?.rawOrder?.order_id || order?.id || "";

  // Real API queries for Order Details and Live Courier Tracking
  const { data: fullOrder, isLoading: isOrderLoading } = useGetOrder(
    isOpen ? targetId : "",
  );
  const { data: trackingData, isLoading: isTrackingLoading } = useTrackOrder(
    isOpen ? targetId : "",
    isOpen && Boolean(targetId),
  );

  if (!isOpen || !order) return null;

  const activeOrder = fullOrder || order.rawOrder;
  const statusLabel =
    activeOrder?.status_label || fullOrder?.status || order.statusText;
  const showDeliveryCode =
    activeOrder?.show_delivery_code ?? order.rawOrder?.show_delivery_code;
  const deliveryCode =
    activeOrder?.delivery_verification_code ||
    order.rawOrder?.delivery_verification_code;

  const waybillNumber =
    trackingData?.courier_waybill_number || activeOrder?.courier_waybill_number;
  const trackingStatus =
    trackingData?.courier_tracking_status ||
    activeOrder?.courier_tracking_status;
  const trackingUrl = trackingData?.courier_tracking_url;

  const timeline: ApiOrderStatusTimelineItem[] =
    activeOrder?.status_timeline || [];
  const courierHistory: OrderTrackingHistoryItem[] =
    trackingData?.history || [];

  // If backend timeline exists, use it; otherwise fallback to full timeline sequence
  const stepsToRender =
    timeline.length > 0
      ? timeline.map((st) => ({
          label: st.label,
          completed: st.completed,
          current: st.current,
          timeStr: formatStepTime(st.timestamp),
        }))
      : [
          {
            label: "Order Placed",
            completed: true,
            current: false,
            timeStr: formatStepTime(activeOrder?.created_at || order.date),
          },
          {
            label: "Confirmed",
            completed:
              order.statusType !== "processing" ||
              activeOrder?.status === "confirmed",
            current: activeOrder?.status === "confirmed",
            timeStr: formatStepTime(activeOrder?.created_at),
          },
          {
            label: "Preparing Order",
            completed:
              order.statusType === "packing" ||
              order.statusType === "shipped" ||
              order.statusType === "delivered",
            current: order.statusType === "packing",
            timeStr: null,
          },
          {
            label: "Packed",
            completed:
              order.statusType === "shipped" ||
              order.statusType === "delivered",
            current: false,
            timeStr: null,
          },
          {
            label: "Waiting for Courier",
            completed:
              order.statusType === "shipped" ||
              order.statusType === "delivered",
            current: false,
            timeStr: null,
          },
          {
            label: "Handed to Courier",
            completed:
              order.statusType === "shipped" ||
              order.statusType === "delivered",
            current: false,
            timeStr: formatStepTime(activeOrder?.shipped_at),
          },
          {
            label: "Shipped",
            completed:
              order.statusType === "shipped" ||
              order.statusType === "delivered",
            current: order.statusType === "shipped",
            timeStr: formatStepTime(activeOrder?.shipped_at),
          },
          {
            label: "Out for Delivery",
            completed: order.statusType === "delivered",
            current: order.statusType === "shipped",
            timeStr: null,
          },
          {
            label: "Delivered",
            completed: order.statusType === "delivered",
            current: order.statusType === "delivered",
            timeStr: formatStepTime(activeOrder?.delivered_at),
          },
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header — Mobile Responsive & Clean Layout */}
        <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#D81B60] text-white flex items-center justify-center font-black shadow-xs shrink-0 mt-0.5">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                  {t("trackingModal.liveTracking")}
                </h3>
                <span className="text-[11px] bg-rose-50 text-[#D81B60] font-extrabold px-2.5 py-0.5 rounded-full border border-rose-100 shrink-0">
                  {getTranslatedStepLabel(statusLabel)}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold truncate">
                #{order.id}{" "}
                <span className="font-medium text-slate-400">
                  • {t("trackingModal.total")} {formatLKR(order.total)}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto bg-slate-100/40">
          {/* Loading Indicator */}
          {(isOrderLoading || isTrackingLoading) && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-[#D81B60]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t("trackingModal.fetching")}</span>
            </div>
          )}

          {/* Delivery Location Note */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
            <MapPin className="w-5 h-5 text-[#D81B60] shrink-0" />
            <div className="text-xs">
              <span className="font-extrabold text-slate-900">
                {t("trackingModal.deliveryAddress")}{" "}
              </span>
              <span className="text-slate-600 font-medium">
                {activeOrder?.delivery_address
                  ? `${activeOrder.delivery_address.address_line1 || ""}, ${
                      activeOrder.delivery_address.postal_city || ""
                    }`
                  : order.deliveryAddress}
              </span>
            </div>
          </div>

          {/* Order Status Timeline Card — Exactly matching user screenshot */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {t("trackingModal.orderStatus")}
            </h4>

            <div className="relative space-y-3.5">
              {/* Pink vertical connector line perfectly centered behind circles */}
              <div className="absolute left-[18px] top-4.5 bottom-4.5 w-0.5 -translate-x-1/2 bg-pink-300 z-0" />

              {stepsToRender.map((step, idx) => {
                const IconComp = getTimelineStepIcon(step.label);
                const isDone = step.completed || step.current;

                return (
                  <div
                    key={idx}
                    className="relative flex items-center justify-between gap-3 z-10"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {/* Vibrant Pink Circular Badge */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 transition-all ${
                          isDone
                            ? "bg-[#D81B60] shadow-md shadow-pink-500/30 ring-4 ring-rose-50"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        <IconComp className="w-4 h-4 stroke-[2.2]" />
                      </div>

                      {/* Step Title */}
                      <span
                        className={`text-xs sm:text-sm font-extrabold truncate ${
                          isDone ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {getTranslatedStepLabel(step.label)}
                      </span>
                    </div>

                    {/* Step Timestamp */}
                    {step.timeStr ? (
                      <span className="text-[11px] sm:text-xs font-semibold text-slate-400 shrink-0">
                        {step.timeStr}
                      </span>
                    ) : (
                      <span className="text-[11px] sm:text-xs font-semibold text-slate-300 shrink-0">
                        {t("status.processing")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier History Event Log (if available) */}
          {/* {courierHistory.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#D81B60]" />
                <span>Courier Event Log</span>
              </h4>
              <div className="space-y-2 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                {courierHistory.map(
                  (item: OrderTrackingHistoryItem, idx: number) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between text-xs border-b border-slate-100 last:border-0 pb-2 last:pb-0"
                    >
                      <div>
                        <p className="font-bold text-slate-800">
                          {item.description || item.status}
                        </p>
                        {item.location && (
                          <p className="text-[11px] text-slate-500">
                            {item.location}
                          </p>
                        )}
                      </div>
                      {item.timestamp && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};
