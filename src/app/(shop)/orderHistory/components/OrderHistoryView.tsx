"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  RotateCw,
  Truck,
  Clock,
  RotateCcw,
  Navigation,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Package,
  XCircle,
  X,
  Image as ImageIcon,
} from "lucide-react";
import {
  OrderRecord,
  OrderTabCategory,
  ApiOrder,
} from "@/interfaces/order.interface";
import { formatLKR } from "@/utils/formatCurrency";
import { OrderTrackingModal } from "./OrderTrackingModal";
import { OrderDetailsModal } from "./OrderDetailsModal";
import { ReturnRequestModal } from "./ReturnRequestModal";
import { Breadcrumb } from "@/components/Breadcumb";
import { Header } from "@/components/Header";
import { useGetOrders } from "@/api/queries/useOrders";
import { useTranslations } from "next-intl";

interface OrderItemAvatarProps {
  imageUrl?: string;
  name?: string;
  size?: "sm" | "md";
}

const OrderItemAvatar: React.FC<OrderItemAvatarProps> = ({
  imageUrl,
  name,
  size = "md",
}) => {
  const [hasError, setHasError] = useState(false);
  const sizeClasses = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  if (!imageUrl || hasError) {
    return (
      <div
        className={`${sizeClasses} rounded-full bg-slate-50 border-2 border-white shadow-xs flex items-center justify-center shrink-0 overflow-hidden`}
        title={name}
      >
        <ImageIcon className={`${iconSize} text-slate-300 stroke-[1.5]`} />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full bg-slate-100 border-2 border-white shadow-xs shrink-0 overflow-hidden`}
      title={name}
    >
      <img
        src={imageUrl}
        alt={name || "Product"}
        className="w-full h-full object-cover rounded-full"
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
};

interface OrderItemsPreviewProps {
  order: OrderRecord;
  size?: "sm" | "md";
}

const OrderItemsPreview: React.FC<OrderItemsPreviewProps> = ({
  order,
  size = "md",
}) => {
  const t = useTranslations("orderHistory");
  const [isHovered, setIsHovered] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Deduplicate unique products for preview avatars (same product bought multiple times shows 1 avatar)
  const uniqueItems = useMemo(() => {
    const seen = new Set<string>();
    const list: typeof order.items = [];
    for (const item of order.items || []) {
      const key = item.productId || item.id || item.name;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(item);
      }
    }
    return list;
  }, [order.items]);

  const totalUnique = uniqueItems.length;
  const avatarCount = Math.min(totalUnique, 3);
  const remainingCount = Math.max(0, totalUnique - avatarCount);
  const isSm = size === "sm";

  if (totalUnique === 0) {
    return <span className="text-xs text-slate-400 font-medium">{t("card.noItems")}</span>;
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setAnchorRect(rect);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  // Determine popup placement (above avatars by default, or below if near top of viewport)
  const isNearTop = anchorRect ? anchorRect.top < 260 : false;
  const popupTop = anchorRect
    ? isNearTop
      ? anchorRect.bottom + 8
      : anchorRect.top - 8
    : 0;

  // Align popup arrow with the first avatar
  const popupLeft = anchorRect
    ? Math.max(
        12,
        Math.min(
          (typeof window !== "undefined" ? window.innerWidth : 1200) - 330,
          anchorRect.left - 12,
        ),
      )
    : 0;

  // Items to display in popup (only real order items)
  const popupItems = order.items || [];

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex items-center select-none cursor-pointer group/preview relative"
      >
        <div
          className={`flex items-center ${isSm ? "-space-x-2" : "-space-x-2.5"}`}
        >
          {uniqueItems.slice(0, 3).map((item, idx) => (
            <OrderItemAvatar
              key={item.productId || item.id || idx}
              imageUrl={item.imageUrl}
              name={item.name}
              size={size}
            />
          ))}
        </div>

        {remainingCount > 0 ? (
          <span
            className={`font-semibold text-slate-700 whitespace-nowrap transition-colors group-hover/preview:text-[#D81B60] ${
              isSm ? "text-xs ml-2" : "text-xs sm:text-sm ml-2.5"
            }`}
          >
            +{remainingCount} {t("card.more")}
          </span>
        ) : totalUnique === 1 && !isSm ? (
          <span className="text-xs font-semibold text-slate-700 ml-2.5 truncate max-w-[150px] group-hover/preview:text-[#D81B60] transition-colors">
            {uniqueItems[0]?.name || order.itemsSummaryText}
            {order.itemsCount > 1 ? ` (x${order.itemsCount})` : ""}
          </span>
        ) : null}
      </div>

      {/* Floating Hover Card Portal */}
      {mounted &&
        isHovered &&
        anchorRect &&
        createPortal(
          <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
              position: "fixed",
              top: `${popupTop}px`,
              left: `${popupLeft}px`,
              transform: isNearTop ? "none" : "translateY(-100%)",
              zIndex: 9999,
            }}
            className="w-76 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-2.5 sm:p-3 pointer-events-auto transition-all animate-fadeIn"
          >
            {/* Speech bubble pointer arrow */}
            {isNearTop ? (
              <div className="absolute -top-1.5 left-7 w-3 h-3 bg-white rotate-45 border-l border-t border-slate-200/90 shadow-2xs" />
            ) : (
              <div className="absolute -bottom-1.5 left-7 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-200/90 shadow-2xs" />
            )}

            {/* Items List */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
              {popupItems.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 font-medium">
                  {t("card.noItems")}
                </div>
              ) : (
                popupItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="bg-slate-50/80 hover:bg-slate-100/80 rounded-xl p-2.5 flex items-center justify-between gap-3 transition-colors"
                  >
                    {/* Left: Avatar & Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <OrderItemAvatar
                        imageUrl={item.imageUrl}
                        name={item.name}
                        size="md"
                      />

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#004B87] truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                          {item.unit ||
                            `SKU-${String(idx + 1).padStart(3, "0")}`}
                        </p>
                      </div>
                    </div>

                    {/* Right: Quantity */}
                    <span className="text-xs font-extrabold text-slate-900 whitespace-nowrap shrink-0">
                      {item.quantity} Pc(s)
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export const OrderHistoryView: React.FC = () => {
  const t = useTranslations("orderHistory");
  // TanStack Query Order Fetch - fetch up to 50 orders to ensure delivered and history orders are included
  const {
    data: serverOrdersData,
    isLoading: isOrdersLoading,
    refetch,
  } = useGetOrders(1, 50);
  const apiOrders: ApiOrder[] = Array.isArray(serverOrdersData)
    ? serverOrdersData
    : serverOrdersData?.orders || [];

  // Filter States
  const [activeCategory, setActiveCategory] =
    useState<OrderTabCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [timelineFilter, setTimelineFilter] = useState("All Time");
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const timelineOptions = [
    { value: "Last 7 Days", label: t("timeline.last7Days") },
    { value: "Last 30 Days", label: t("timeline.last30Days") },
    { value: "Last 90 Days", label: t("timeline.last90Days") },
    { value: "Year 2026", label: t("timeline.year2026") },
    { value: "All Time", label: t("timeline.allTime") },
  ];

  // Modal States
  const [trackingOrder, setTrackingOrder] = useState<OrderRecord | null>(null);
  const [detailsOrder, setDetailsOrder] = useState<OrderRecord | null>(null);
  const [returnOrder, setReturnOrder] = useState<OrderRecord | null>(null);

  // Helper to format human-readable status labels with translations
  const formatOrderStatusLabel = (
    status: string,
    statusLabel?: string,
    timeline?: any[],
  ): string => {
    const s = (status || "").toLowerCase().trim();
    if (s === "cancelled" || s === "canceled") return t("status.cancelled");
    if (s === "delivered" || s === "completed") return t("status.delivered");
    if (s === "refunded") return t("status.refunded");
    if (s === "return_requested") return t("status.returnRequested");
    if (s === "return_approved") return t("status.returnApproved");
    if (s === "return_rejected") return t("status.returnRejected");

    switch (s) {
      case "pending":
        return t("status.orderPlaced");
      case "confirmed":
        return t("status.confirmed");
      case "processing":
        return t("status.processing");
      case "packing":
        return t("status.preparingOrder");
      case "packed":
        return t("status.packed");
      case "ready_for_pickup":
        return t("status.readyForPickup");
      case "shipped":
      case "handed_to_courier":
        return t("status.dispatched");
      case "out_for_delivery":
        return t("status.outForDelivery");
      case "delivery_failed":
        return t("status.deliveryFailed");
      default:
        break;
    }

    const currentStep = timeline?.find((st) => st.current);
    if (currentStep?.label) {
      const stepL = currentStep.label.toLowerCase();
      if (stepL.includes("placed")) return t("status.orderPlaced");
      if (stepL.includes("confirm")) return t("status.confirmed");
      if (stepL.includes("prepar") || stepL.includes("process")) return t("status.processing");
      if (stepL.includes("packed") || stepL.includes("packing")) return t("status.packed");
      if (stepL.includes("ready")) return t("status.readyForPickup");
      if (stepL.includes("dispatch") || stepL.includes("shipp")) return t("status.dispatched");
      if (stepL.includes("out") || stepL.includes("delivery")) return t("status.outForDelivery");
      if (stepL.includes("deliver")) return t("status.delivered");
      return currentStep.label;
    }
    if (statusLabel && statusLabel.toLowerCase() !== "pending") {
      const lblL = statusLabel.toLowerCase();
      if (lblL.includes("placed")) return t("status.orderPlaced");
      if (lblL.includes("confirm")) return t("status.confirmed");
      if (lblL.includes("prepar") || lblL.includes("process")) return t("status.processing");
      if (lblL.includes("deliver")) return t("status.delivered");
      if (lblL.includes("cancel")) return t("status.cancelled");
      return statusLabel;
    }
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : "";
  };

  // Helper to map backend status to UI statusType
  const mapOrderStatusType = (
    status: string,
    isDelivered?: boolean,
    isCancelled?: boolean,
    isReturn?: boolean,
  ): OrderRecord["statusType"] => {
    const s = (status || "").toLowerCase().trim();
    if (
      isReturn ||
      [
        "refunded",
        "return_requested",
        "return_approved",
        "return_rejected",
        "rto_initiated",
        "rto_delivered",
      ].includes(s)
    ) {
      return "refunded";
    }
    if (isCancelled || ["cancelled", "canceled", "delivery_failed"].includes(s)) {
      return "cancelled";
    }
    if (isDelivered || ["delivered", "completed"].includes(s)) {
      return "delivered";
    }
    if (["shipped", "out_for_delivery", "handed_to_courier"].includes(s)) {
      return "shipped";
    }
    if (["packing", "packed", "ready_for_pickup"].includes(s)) {
      return "packing";
    }
    return "processing";
  };

  // Helper to render customized status badge with distinct icons and colors per status
  const renderStatusBadge = (order: OrderRecord, size: "sm" | "md" = "md") => {
    const rawStatus = (order.rawOrder?.status || "").toLowerCase().trim();
    const text = order.statusText || rawStatus;
    const isSm = size === "sm";
    const badgeBaseClass = `inline-flex items-center gap-1.5 rounded-full font-extrabold ${
      isSm ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
    }`;
    const iconClass = isSm ? "w-3 h-3" : "w-3.5 h-3.5";

    // 1. Return / Refunded
    if (
      order.category === "returns" ||
      order.statusType === "refunded" ||
      [
        "refunded",
        "return_requested",
        "return_approved",
        "return_rejected",
        "rto_initiated",
        "rto_delivered",
      ].includes(rawStatus)
    ) {
      return (
        <span
          className={`${badgeBaseClass} bg-purple-50 border border-purple-200 text-purple-800`}
        >
          <RotateCcw className={`${iconClass} text-purple-600`} />
          <span>{text}</span>
        </span>
      );
    }

    // 2. Cancelled
    if (
      order.category === "cancelled" ||
      order.statusType === "cancelled" ||
      ["cancelled", "canceled", "delivery_failed"].includes(rawStatus)
    ) {
      return (
        <span
          className={`${badgeBaseClass} bg-rose-50 border border-rose-200 text-rose-700`}
        >
          <XCircle className={`${iconClass} text-rose-600`} />
          <span>{text}</span>
        </span>
      );
    }

    // 3. Delivered
    if (
      ["delivered", "completed"].includes(rawStatus) ||
      order.statusType === "delivered" ||
      order.category === "previous"
    ) {
      return (
        <span
          className={`${badgeBaseClass} bg-emerald-50 border border-emerald-200 text-emerald-800`}
        >
          <CheckCircle2 className={`${iconClass} text-emerald-600`} />
          <span>{text}</span>
        </span>
      );
    }

    // 4. Order Placed / Pending
    if (rawStatus === "pending") {
      return (
        <span
          className={`${badgeBaseClass} bg-sky-50 border border-sky-200 text-sky-700`}
        >
          <Clock className={`${iconClass} text-sky-600`} />
          <span>{text}</span>
        </span>
      );
    }

    // 5. Confirmed
    if (rawStatus === "confirmed") {
      return (
        <span
          className={`${badgeBaseClass} bg-teal-50 border border-teal-200 text-teal-800`}
        >
          <CheckCircle2 className={`${iconClass} text-teal-600`} />
          <span>{text}</span>
        </span>
      );
    }

    // 6. Processing / Packing / Packed / Ready for pickup
    if (
      ["processing", "packing", "packed", "ready_for_pickup"].includes(
        rawStatus,
      ) ||
      order.statusType === "packing"
    ) {
      return (
        <span
          className={`${badgeBaseClass} bg-amber-50 border border-amber-200 text-amber-800`}
        >
          <Package className={`${iconClass} text-amber-600`} />
          <span>{text}</span>
        </span>
      );
    }

    // 7. Shipped / Out for delivery / Handed to courier
    if (
      ["shipped", "out_for_delivery", "handed_to_courier"].includes(
        rawStatus,
      ) ||
      order.statusType === "shipped"
    ) {
      return (
        <span
          className={`${badgeBaseClass} bg-emerald-100 border border-emerald-300 text-emerald-800`}
        >
          <span
            className={`${isSm ? "w-1.5 h-1.5" : "w-2 h-2"} rounded-full bg-emerald-500 animate-ping`}
          />
          <span>● {text}</span>
        </span>
      );
    }

    // Fallback default
    return (
      <span
        className={`${badgeBaseClass} bg-slate-100 border border-slate-200 text-slate-700`}
      >
        <Clock className={iconClass} />
        <span>{text}</span>
      </span>
    );
  };

  // Map server orders to OrderRecord UI format
  const ordersList: OrderRecord[] = useMemo(() => {
    return apiOrders.map((o) => {
      const rawStatus = (
        o.status ||
        (o as any).order_status ||
        (o as any).orderStatus ||
        ""
      )
        .toLowerCase()
        .trim();
      const statusLabel = (
        o.status_label ||
        (o as any).statusLabel ||
        ""
      )
        .toLowerCase()
        .trim();
      const courierStatus = (
        o.courier_tracking_status ||
        (o as any).courierTrackingStatus ||
        ""
      )
        .toLowerCase()
        .trim();
      const hasDeliveredAt = Boolean(o.delivered_at || (o as any).deliveredAt);
      const hasCancelledAt = Boolean(o.cancelled_at || (o as any).cancelledAt);

      const isReturn =
        [
          "refunded",
          "return_requested",
          "return_approved",
          "return_rejected",
          "rto_initiated",
          "rto_delivered",
        ].includes(rawStatus) ||
        statusLabel.includes("refund") ||
        statusLabel.includes("return") ||
        courierStatus.includes("return");

      const isCancelled =
        !isReturn &&
        ([
          "cancelled",
          "canceled",
          "delivery_failed",
        ].includes(rawStatus) ||
          hasCancelledAt ||
          statusLabel.includes("cancel") ||
          courierStatus.includes("cancel") ||
          courierStatus.includes("fail"));

      const isDelivered =
        !isReturn &&
        !isCancelled &&
        ([
          "delivered",
          "completed",
        ].includes(rawStatus) ||
          hasDeliveredAt ||
          statusLabel === "delivered" ||
          statusLabel === "completed" ||
          courierStatus === "delivered" ||
          (
            o.delivery_verification_status ||
            (o as any).deliveryVerificationStatus ||
            ""
          ).toLowerCase() === "verified" ||
          Boolean(
            o.status_timeline?.some(
              (st) =>
                st.status?.toLowerCase() === "delivered" &&
                (st.completed || st.current),
            ),
          ));

      // Category assignment:
      // "all" covers everything
      // "current" -> In progress
      // "previous" -> Delivered
      // "cancelled" -> Cancelled
      // "returns" -> Returned / Refunded
      const category: OrderTabCategory = isReturn
        ? "returns"
        : isCancelled
          ? "cancelled"
          : isDelivered
            ? "previous"
            : "current";

      const statusType = mapOrderStatusType(
        rawStatus,
        isDelivered,
        isCancelled,
        isReturn,
      );

      const statusText = isReturn
        ? formatOrderStatusLabel(rawStatus, o.status_label, o.status_timeline)
        : isCancelled
          ? t("status.cancelled")
          : isDelivered
            ? t("status.delivered")
            : formatOrderStatusLabel(rawStatus, o.status_label, o.status_timeline);

      return {
        id: String(
          o.order_number ||
            (o as any).orderNumber ||
            o.order_id ||
            (o as any).orderId ||
            (o as any).id ||
            "",
        ),
        orderId: String(
          o.order_id ||
            (o as any).orderId ||
            (o as any).id ||
            o.order_number ||
            "",
        ),
        rawOrder: o,
        typeTag: "Standard",
        date: new Date(o.created_at).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        branch: o.delivery_address?.postal_city || "Branch Store",
        itemsCount: o.item_count || o.items?.length || 0,
        itemsSummaryText:
          o.items?.map((i) => i.product_name).join(", ") || "Grocery items",
        statusText,
        statusType,
        category,
        total: o.total_amount,
        riderName: "Courier Rider",
        deliveryAddress: o.delivery_address
          ? `${o.delivery_address.address_line1 || ""}, ${
              o.delivery_address.postal_city || ""
            }`
          : "Saved Address",
        paymentMethod: o.payment?.title || o.payment_method,
        returnWindowExpiresAt: o.return_window_expires_at,
        items: (o.items || []).map((item, idx) => ({
          id: item.product_id || (item as any).id || `item-${idx}`,
          productId: item.product_id || (item as any).productId || (item as any).id,
          orderItemId: item.order_item_id || (item as any).orderItemId,
          name: item.product_name || (item as any).name || "Item",
          quantity: item.quantity,
          price: item.unit_price || (item as any).price || 0,
          unit: item.product_sku || (item as any).unit || "",
          imageUrl: item.product_image || (item as any).imageUrl || "",
          isReturnable: item.is_returnable,
          isReviewed: item.is_reviewed || (item as any).isReviewed || false,
        })),
      };
    });
  }, [apiOrders]);

  // Helper to parse order date
  const getOrderDate = (order: OrderRecord): Date | null => {
    const rawDate =
      order.rawOrder?.created_at ||
      (order.rawOrder as any)?.createdAt ||
      order.date;
    if (!rawDate) return null;
    const d = new Date(rawDate);
    return isNaN(d.getTime()) ? null : d;
  };

  // Filter orders by selected timeline range
  const timelineFilteredOrders = useMemo(() => {
    if (!timelineFilter || timelineFilter === "All Time") {
      return ordersList;
    }

    const now = new Date();
    // End of today (23:59:59.999)
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    return ordersList.filter((order) => {
      const orderDate = getOrderDate(order);
      if (!orderDate) return true;

      const pastLimit = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0,
      );

      switch (timelineFilter) {
        case "Last 7 Days":
          pastLimit.setDate(pastLimit.getDate() - 7);
          return orderDate >= pastLimit && orderDate <= endOfToday;
        case "Last 30 Days":
          pastLimit.setDate(pastLimit.getDate() - 30);
          return orderDate >= pastLimit && orderDate <= endOfToday;
        case "Last 90 Days":
          pastLimit.setDate(pastLimit.getDate() - 90);
          return orderDate >= pastLimit && orderDate <= endOfToday;
        case "Year 2026": {
          const currentYear = now.getFullYear();
          return (
            orderDate.getFullYear() === 2026 ||
            orderDate.getFullYear() === currentYear
          );
        }
        default:
          return true;
      }
    });
  }, [ordersList, timelineFilter]);

  // Category counts based on active timeline filter
  const allCount = useMemo(() => timelineFilteredOrders.length, [timelineFilteredOrders]);
  const currentCount = useMemo(
    () => timelineFilteredOrders.filter((o) => o.category === "current").length,
    [timelineFilteredOrders],
  );
  const previousCount = useMemo(
    () => timelineFilteredOrders.filter((o) => o.category === "previous").length,
    [timelineFilteredOrders],
  );
  const cancelledCount = useMemo(
    () => timelineFilteredOrders.filter((o) => o.category === "cancelled").length,
    [timelineFilteredOrders],
  );
  const returnsCount = useMemo(
    () => timelineFilteredOrders.filter((o) => o.category === "returns").length,
    [timelineFilteredOrders],
  );

  // Filtered list
  const filteredOrders = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase();
    const queryWithoutHash = rawQuery.replace(/^#+/, "").trim();
    const queryAlphanumeric = rawQuery.replace(/[^a-z0-9]/g, "");

    return timelineFilteredOrders.filter((order) => {
      // If there is an active search query:
      if (rawQuery) {
        // Collect all possible ID variants
        const orderIdStr = String(order.id || "").toLowerCase();
        const rawOrderIdStr = String(order.orderId || "").toLowerCase();
        const rawOrderNum = String(
          order.rawOrder?.order_number ||
            (order.rawOrder as any)?.orderNumber ||
            "",
        ).toLowerCase();
        const rawOrderActualId = String(
          order.rawOrder?.order_id ||
            (order.rawOrder as any)?.id ||
            (order.rawOrder as any)?.orderId ||
            "",
        ).toLowerCase();
        const waybill = String(
          order.rawOrder?.courier_waybill_number ||
            (order.rawOrder as any)?.tracking_number ||
            "",
        ).toLowerCase();
        const deliveryCode = String(
          order.rawOrder?.delivery_verification_code || "",
        ).toLowerCase();

        const idCandidates = [
          orderIdStr,
          rawOrderIdStr,
          rawOrderNum,
          rawOrderActualId,
          waybill,
          deliveryCode,
        ].filter(Boolean);

        // Check if query matches any order ID (with #, without #, or alphanumeric normalized)
        const matchesId = idCandidates.some((id) => {
          const idAlpha = id.replace(/[^a-z0-9]/g, "");
          return (
            id.includes(rawQuery) ||
            (queryWithoutHash && id.includes(queryWithoutHash)) ||
            `#${id}`.includes(rawQuery) ||
            (queryAlphanumeric && idAlpha.includes(queryAlphanumeric))
          );
        });

        // Check if query matches items, branch, address, status
        const itemsSummary = String(order.itemsSummaryText || "").toLowerCase();
        const branchStr = String(order.branch || "").toLowerCase();
        const addressStr = String(order.deliveryAddress || "").toLowerCase();
        const statusStr = String(order.statusText || "").toLowerCase();

        const matchesItems =
          itemsSummary.includes(rawQuery) ||
          (queryWithoutHash && itemsSummary.includes(queryWithoutHash)) ||
          (order.items || []).some((item) => {
            const itemName = String(item.name || "").toLowerCase();
            const itemUnit = String(item.unit || "").toLowerCase();
            return (
              itemName.includes(rawQuery) ||
              (queryWithoutHash && itemName.includes(queryWithoutHash)) ||
              (queryWithoutHash && itemUnit.includes(queryWithoutHash))
            );
          });

        const matchesBranch =
          branchStr.includes(rawQuery) ||
          (queryWithoutHash && branchStr.includes(queryWithoutHash));
        const matchesAddress =
          addressStr.includes(rawQuery) ||
          (queryWithoutHash && addressStr.includes(queryWithoutHash));
        const matchesStatus =
          statusStr.includes(rawQuery) ||
          (queryWithoutHash && statusStr.includes(queryWithoutHash));

        const isSearchMatch =
          matchesId ||
          matchesItems ||
          matchesBranch ||
          matchesAddress ||
          matchesStatus;

        if (!isSearchMatch) return false;

        // If the query directly matches an order ID, show it even if the user is on a different tab.
        // For general item searches, respect the active category if not "all".
        if (
          activeCategory !== "all" &&
          !matchesId &&
          order.category !== activeCategory
        ) {
          return false;
        }

        return true;
      }

      // Category match: "all" matches all categories when no search query
      if (activeCategory !== "all" && order.category !== activeCategory) {
        return false;
      }

      return true;
    });
  }, [timelineFilteredOrders, activeCategory, searchQuery]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch().finally(() => setIsRefreshing(false));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* 1. Header Breadcrumb & Title Section */}
      <div className="space-y-2">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: t("breadcrumb.account"), href: "/myAccount" },
            { label: t("breadcrumb.orderHistory"), isCurrent: true },
          ]}
        />

        {/* Header Title */}
        <Header
          title={t("header.title")}
          description={t("header.subtitle")}
          size="xl"
          className="pt-1"
        />
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex items-center gap-2 sm:gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="w-full pl-9 sm:pl-10 pr-9 py-2.5 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-slate-300 rounded-full text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all truncate"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Timeline Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsTimelineOpen(!isTimelineOpen)}
            className="px-3 sm:px-4 py-2.5 bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 border border-slate-200/60 cursor-pointer whitespace-nowrap"
          >
            <span>
              <span className="hidden sm:inline">{t("timeline.label")}</span>
              {timelineOptions.find((opt) => opt.value === timelineFilter)?.label || timelineFilter}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </button>

          {isTimelineOpen && (
            <>
              <div
                className="fixed inset-0 z-15"
                onClick={() => setIsTimelineOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-2 text-xs font-bold text-slate-700 animate-fadeIn">
                {timelineOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setTimelineFilter(opt.value);
                      setIsTimelineOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-rose-50 hover:text-[#D81B60] transition-colors cursor-pointer ${
                      timelineFilter === opt.value ? "text-[#D81B60] bg-rose-50/50 font-black" : ""
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. Segmented Navigation Tabs */}
      <div className="bg-slate-100/80 rounded-2xl p-1.5 flex items-center gap-1.5 border border-slate-200/50 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* All Orders Tab */}
        <button
          onClick={() => setActiveCategory("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeCategory === "all"
              ? "bg-[#BE185D] text-white shadow-xs"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Package className="w-4 h-4 shrink-0" />
          <span>{t("tabs.all")}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeCategory === "all"
                ? "bg-rose-950/30 text-white"
                : "bg-slate-200 text-slate-800"
            }`}
          >
            {allCount}
          </span>
        </button>

        {/* In Progress Tab */}
        <button
          onClick={() => setActiveCategory("current")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeCategory === "current"
              ? "bg-[#BE185D] text-white shadow-xs"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <Truck className="w-4 h-4 shrink-0" />
          <span>{t("tabs.active")}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeCategory === "current"
                ? "bg-rose-950/30 text-white"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {currentCount}
          </span>
        </button>

        {/* Delivered / Completed Orders Tab */}
        <button
          onClick={() => setActiveCategory("previous")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeCategory === "previous"
              ? "bg-[#BE185D] text-white shadow-xs"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{t("tabs.completed")}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeCategory === "previous"
                ? "bg-rose-950/30 text-white"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {previousCount}
          </span>
        </button>

        {/* Cancelled Orders Tab */}
        <button
          onClick={() => setActiveCategory("cancelled")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeCategory === "cancelled"
              ? "bg-[#BE185D] text-white shadow-xs"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{t("tabs.cancelled")}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeCategory === "cancelled"
                ? "bg-rose-950/30 text-white"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            {cancelledCount}
          </span>
        </button>

        {/* Return Orders Tab */}
        <button
          onClick={() => setActiveCategory("returns")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
            activeCategory === "returns"
              ? "bg-[#BE185D] text-white shadow-xs"
              : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
          }`}
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span>{t("tabs.returns")}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
              activeCategory === "returns"
                ? "bg-rose-950/30 text-white"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {returnsCount}
          </span>
        </button>
      </div>

      {/* 4. Orders Content (Responsive: List view on Mobile, Table view on Desktop) */}
      {isOrdersLoading ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-2xs">
          <div className="flex flex-col items-center justify-center space-y-2">
            <RotateCw className="w-6 h-6 animate-spin text-[#D81B60]" />
            <p className="text-xs font-bold text-slate-500">
              {t("card.loading")}
            </p>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-2xs">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <p className="text-sm font-extrabold text-slate-800">
              {t("empty.title")}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {t("empty.subtitle")}
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition-all cursor-pointer"
            >
              {t("search.reset")}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile List View (md:hidden) */}
          <div className="block md:hidden space-y-3.5">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3"
              >
                {/* Top Row: Order ID & Tag + Status Badge */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[#D81B60]">
                      #{order.id}
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/60">
                      {order.typeTag}
                    </span>
                  </div>

                  <div>{renderStatusBadge(order, "sm")}</div>
                </div>

                {/* Middle Grid: Date, Branch & Items */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      {t("card.date")}
                    </span>
                    <p className="font-bold text-slate-900">{order.date}</p>
                    <p className="text-slate-500 font-medium text-[11px]">
                      {order.branch}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      {t("card.items")} ({order.itemsCount})
                    </span>
                    <OrderItemsPreview order={order} size="sm" />
                  </div>
                </div>

                {/* Bottom Row: Total & Actions */}
                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      {t("card.total")}
                    </span>
                    <span className="font-extrabold text-sm text-[#D81B60]">
                      {formatLKR(order.total)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Return Items Button for Delivered orders */}
                    {(order.category === "previous" ||
                      order.statusType === "delivered") &&
                      ![
                        "return_requested",
                        "return_approved",
                        "return_rejected",
                        "refunded",
                      ].includes(
                        (order.rawOrder?.status || "").toLowerCase(),
                      ) && (
                        <button
                          onClick={() => setReturnOrder(order)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-[#D81B60] border border-rose-200/80 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-[#D81B60]" />
                          <span>{t("card.returnBtn")}</span>
                        </button>
                      )}

                    <button
                      onClick={() => setTrackingOrder(order)}
                      className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                        order.category === "current" ||
                        order.statusType === "shipped" ||
                        order.statusType === "packing" ||
                        order.statusType === "processing"
                          ? "bg-[#D81B60] hover:bg-[#B7154E] text-white shadow-2xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <Navigation className="w-3 h-3" />
                      <span>{t("card.trackBtn")}</span>
                    </button>

                    <button
                      onClick={() => setDetailsOrder(order)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-all cursor-pointer"
                    >
                      {t("card.viewDetailsBtn")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (hidden md:block) */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3.5">{t("card.orderId")}</th>
                    <th className="px-5 py-3.5">{t("card.dateBranch")}</th>
                    <th className="px-5 py-3.5">{t("card.items")}</th>
                    <th className="px-5 py-3.5">{t("card.status")}</th>
                    <th className="px-5 py-3.5">{t("card.total")}</th>
                    <th className="px-5 py-3.5 text-right">{t("card.actions")}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Order ID */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#D81B60] tracking-tight">
                            #{order.id}
                          </span>
                        </div>
                      </td>

                      {/* Date & Branch */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">
                            {order.date}
                          </p>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <OrderItemsPreview order={order} size="md" />
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {renderStatusBadge(order, "md")}
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-extrabold text-sm sm:text-base text-[#D81B60]">
                          {formatLKR(order.total)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Return Items Button for Delivered orders */}
                          {(order.category === "previous" ||
                            order.statusType === "delivered") &&
                            ![
                              "return_requested",
                              "return_approved",
                              "return_rejected",
                              "refunded",
                            ].includes(
                              (order.rawOrder?.status || "").toLowerCase(),
                            ) && (
                              <button
                                onClick={() => setReturnOrder(order)}
                                className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-[#D81B60] border border-rose-200/80 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-[#D81B60]" />
                                <span>{t("card.returnBtn")}</span>
                              </button>
                            )}

                          <button
                            onClick={() => setTrackingOrder(order)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                              order.category === "current" ||
                              order.statusType === "shipped" ||
                              order.statusType === "packing" ||
                              order.statusType === "processing"
                                ? "bg-[#D81B60] hover:bg-[#B7154E] text-white shadow-2xs"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>{t("card.trackBtn")}</span>
                          </button>

                          <button
                            onClick={() => setDetailsOrder(order)}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-all cursor-pointer"
                          >
                            {t("card.viewDetailsBtn")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modals */}
      <OrderTrackingModal
        order={trackingOrder}
        isOpen={!!trackingOrder}
        onClose={() => setTrackingOrder(null)}
      />

      <OrderDetailsModal
        order={detailsOrder}
        isOpen={!!detailsOrder}
        onClose={() => setDetailsOrder(null)}
        onTrackOrder={(ord) => setTrackingOrder(ord)}
        onRequestReturn={(ord) => setReturnOrder(ord)}
      />

      <ReturnRequestModal
        order={returnOrder}
        isOpen={!!returnOrder}
        onClose={() => setReturnOrder(null)}
        onSuccess={() => {
          setReturnOrder(null);
          refetch();
        }}
      />
    </div>
  );
};
