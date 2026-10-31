"use client";

import React from "react";
import {
  X,
  Printer,
  MapPin,
  CreditCard,
  CheckCircle,
  Clock,
  ArrowRight,
  Download,
  Loader2,
  Navigation,
  Ban,
  AlertOctagon,
  RotateCcw,
  Star,
  Send,
  Check,
} from "lucide-react";
import { OrderRecord, OrderItemRecord } from "@/interfaces/order.interface";
import { formatLKR } from "@/utils/formatCurrency";
import { useToastStore } from "@/state/toast.store";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  useDownloadInvoice,
  useCancelOrder,
  useGetOrder,
} from "@/api/queries/useOrders";
import { useSubmitReview } from "@/api/queries/useReviews";
import { useTranslations } from "next-intl";

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: "1★ Poor",
  2: "2★ Fair",
  3: "3★ Good",
  4: "4★ Very Good",
  5: "5★ Excellent",
};

interface OrderDetailsModalProps {
  order: OrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder?: (order: OrderRecord) => void;
  onRequestReturn?: (order: OrderRecord) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onTrackOrder,
  onRequestReturn,
}) => {
  const t = useTranslations("orderHistory");
  useBodyScrollLock(isOpen);
  const addToast = useToastStore((state) => state.addToast);

  const downloadInvoiceMutation = useDownloadInvoice();
  const cancelOrderMutation = useCancelOrder();
  const submitReviewMutation = useSubmitReview();

  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const [activeReviewItemId, setActiveReviewItemId] = React.useState<string | null>(null);
  const [ratings, setRatings] = React.useState<Record<string, number>>({});
  const [hoverRatings, setHoverRatings] = React.useState<Record<string, number>>({});
  const [comments, setComments] = React.useState<Record<string, string>>({});
  const [reviewedItemMap, setReviewedItemMap] = React.useState<Record<string, boolean>>({});
  const [submittingItemId, setSubmittingItemId] = React.useState<string | null>(null);

  const targetId = order?.orderId || order?.rawOrder?.order_id || order?.id || "";
  const { data: fullOrder } = useGetOrder(
    isOpen && Boolean(targetId) ? targetId : ""
  );

  if (!isOpen || !order) return null;

  const canCancelOrder = Boolean(
    order.rawOrder?.can_cancel !== undefined
      ? order.rawOrder.can_cancel
      : !["shipped", "out_for_delivery", "delivered", "cancelled", "refunded"].includes(
          order.rawOrder?.status?.toLowerCase() || order.statusType
        )
  );

  const isConfirmedOrder = Boolean(
    order.rawOrder?.status
      ? [
          "confirmed",
          "processing",
          "packing",
          "packed",
          "ready_for_pickup",
          "shipped",
          "out_for_delivery",
          "delivered",
        ].includes(order.rawOrder.status.toLowerCase())
      : order.statusType !== "cancelled" &&
          order.statusText.toLowerCase() !== "order placed" &&
          order.statusText.toLowerCase() !== "pending"
  );

  const isOrderCancelled = Boolean(
    order.statusType === "cancelled" ||
      ["cancelled", "canceled"].includes(
        (order.rawOrder?.status || "").toLowerCase()
      )
  );

  const handleSubmitItemReview = (item: OrderItemRecord) => {
    const targetProductId = item.productId || item.id;
    if (!targetProductId) return;

    const fullItem = fullOrder?.items?.find(
      (fi) => String(fi.product_id) === String(targetProductId)
    ) || order.rawOrder?.items?.find(
      (ri) => String(ri.product_id) === String(targetProductId)
    );

    const resolvedOrderItemId =
      item.orderItemId ||
      fullItem?.order_item_id ||
      (fullItem as any)?.id ||
      (item as any)?.order_item_id;

    if (!resolvedOrderItemId) {
      addToast({
        title: t("detailsModal.reviewFailed"),
        message: "Order line item details are still loading. Please try again.",
        type: "warning",
      });
      return;
    }

    const rating = ratings[item.id] || 5;
    const comment = (comments[item.id] || "").trim();

    if (!comment) {
      addToast({
        title: t("detailsModal.reviewFailed"),
        message: t("detailsModal.reviewEmptyComment"),
        type: "warning",
      });
      return;
    }

    setSubmittingItemId(item.id);

    submitReviewMutation.mutate(
      {
        productId: targetProductId,
        payload: {
          rating,
          comment,
          order_item_id: resolvedOrderItemId,
        },
      },
      {
        onSuccess: () => {
          setReviewedItemMap((prev) => ({
            ...prev,
            [item.id]: true,
            [resolvedOrderItemId]: true,
            [targetProductId]: true,
          }));
          setActiveReviewItemId(null);
          setSubmittingItemId(null);
          addToast({
            title: t("detailsModal.reviewSubmitted"),
            message: t("detailsModal.reviewSubmittedDesc", { product: item.name }),
            type: "success",
          });
        },
        onError: (err: any) => {
          setSubmittingItemId(null);
          const detail = err?.response?.data?.detail;
          const errorMsg =
            typeof detail === "string"
              ? detail
              : Array.isArray(detail) && detail[0]?.msg
              ? detail[0].msg
              : err?.response?.data?.message ||
                "Could not submit review at this time.";
          addToast({
            title: t("detailsModal.reviewFailed"),
            message: errorMsg,
            type: "error",
          });
        },
      }
    );
  };

  const handleDownloadInvoice = () => {
    const targetId = order.orderId || order.rawOrder?.order_id || order.id;
    if (targetId) {
      downloadInvoiceMutation.mutate(targetId);
    }
  };

  const handleConfirmCancel = () => {
    const targetId = order.orderId || order.rawOrder?.order_id || order.id;
    if (targetId) {
      cancelOrderMutation.mutate(
        { id: targetId },
        {
          onSuccess: () => {
            setShowCancelConfirm(false);
            onClose();
          },
        }
      );
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-lg">
                {t("detailsModal.title")}
              </h3>
              <span className="text-xs font-extrabold text-[#D81B60] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                #{order.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {t("detailsModal.placedOn", { date: order.date })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isConfirmedOrder && (
              <button
                onClick={handleDownloadInvoice}
                disabled={downloadInvoiceMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-[#D81B60] border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                title={t("detailsModal.downloadInvoice")}
              >
                {downloadInvoiceMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#D81B60]" />
                ) : (
                  <Download className="w-4 h-4 text-[#D81B60]" />
                )}
                <span className="hidden sm:inline">
                  {downloadInvoiceMutation.isPending ? t("detailsModal.downloading") : t("detailsModal.downloadInvoice")}
                </span>
              </button>
            )}
            <button
              onClick={handlePrintInvoice}
              className="p-2 text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              title="Print Invoice"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Info Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase">
                <MapPin className="w-3.5 h-3.5 text-[#D81B60]" />
                <span>{t("detailsModal.deliveryAddress")}</span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {order.deliveryAddress || "Saved Address"}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase">
                <CreditCard className="w-3.5 h-3.5 text-[#D81B60]" />
                <span>{t("detailsModal.paymentMethod")}</span>
              </div>
              <p className="text-xs font-bold text-slate-800">
                {order.paymentMethod || "Pay on delivery"}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="bg-slate-100/70 px-4 py-2.5 text-xs font-extrabold text-slate-600 grid grid-cols-12 gap-2">
              <span className="col-span-6">{t("detailsModal.itemDescription")}</span>
              <span className="col-span-2 text-center">{t("detailsModal.qty")}</span>
              <span className="col-span-2 text-right">{t("detailsModal.unitPrice")}</span>
              <span className="col-span-2 text-right">{t("detailsModal.total")}</span>
            </div>

            <div className="divide-y divide-slate-100">
              {order.items.map((item) => {
                const targetProductId = item.productId || item.id;
                const fullItem = fullOrder?.items?.find(
                  (fi) => String(fi.product_id) === String(targetProductId)
                ) || order.rawOrder?.items?.find(
                  (ri) => String(ri.product_id) === String(targetProductId)
                );

                const itemOrderItemId =
                  item.orderItemId ||
                  fullItem?.order_item_id ||
                  (item as any)?.order_item_id ||
                  (fullItem as any)?.id;

                const isItemReviewed = Boolean(
                  item.isReviewed ||
                    fullItem?.is_reviewed ||
                    reviewedItemMap[item.id] ||
                    (itemOrderItemId && reviewedItemMap[itemOrderItemId]) ||
                    (targetProductId && reviewedItemMap[targetProductId])
                );
                const isReviewOpen = activeReviewItemId === item.id;
                const currentRating = ratings[item.id] ?? 5;
                const hoverRating = hoverRatings[item.id] ?? 0;
                const effectiveRating = hoverRating || currentRating;

                return (
                  <div key={item.id} className="divide-y divide-slate-100/60">
                    <div className="px-4 py-3 text-xs grid grid-cols-12 gap-2 items-center hover:bg-slate-50 transition-colors">
                      <div className="col-span-6 flex items-center gap-3">
                        <img
                          src={
                            item.imageUrl ||
                            "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=120&auto=format&fit=crop"
                          }
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 leading-snug">{item.name}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] text-slate-400 font-medium">
                              Unit: {item.unit || "pack"}
                            </span>

                            {!isOrderCancelled && (
                              isItemReviewed ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>{t("detailsModal.reviewed")}</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveReviewItemId(isReviewOpen ? null : item.id)
                                  }
                                  className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#D81B60] hover:text-[#C2185B] bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full transition-all cursor-pointer shadow-2xs"
                                >
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>{t("detailsModal.writeReview")}</span>
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="col-span-2 text-center font-extrabold text-slate-700">
                        x{item.quantity}
                      </span>

                      <span className="col-span-2 text-right font-medium text-slate-600">
                        {formatLKR(item.price)}
                      </span>

                      <span className="col-span-2 text-right font-extrabold text-slate-900">
                        {formatLKR(item.price * item.quantity)}
                      </span>
                    </div>

                    {/* Inline Review Form */}
                    {isReviewOpen && !isItemReviewed && !isOrderCancelled && (
                      <div className="bg-rose-50/40 border-t border-rose-100/80 p-4 space-y-3 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700">
                              {t("detailsModal.rateThisItem")}:
                            </span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() =>
                                    setRatings((prev) => ({ ...prev, [item.id]: star }))
                                  }
                                  onMouseEnter={() =>
                                    setHoverRatings((prev) => ({
                                      ...prev,
                                      [item.id]: star,
                                    }))
                                  }
                                  onMouseLeave={() =>
                                    setHoverRatings((prev) => ({
                                      ...prev,
                                      [item.id]: 0,
                                    }))
                                  }
                                  className="p-1 cursor-pointer transition-transform hover:scale-120 focus:outline-none"
                                  title={`${star} Star`}
                                >
                                  <Star
                                    className={`w-4 h-4 ${
                                      star <= effectiveRating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-300"
                                    }`}
                                  />
                                </button>
                              ))}
                              <span className="text-xs font-bold text-amber-600 ml-1.5">
                                {RATING_DESCRIPTIONS[effectiveRating] || `${effectiveRating}★`}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {item.name}
                          </span>
                        </div>

                        <textarea
                          value={comments[item.id] || ""}
                          onChange={(e) =>
                            setComments((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          placeholder={t("detailsModal.reviewPlaceholder")}
                          rows={2}
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#D81B60] bg-white text-slate-800 placeholder:text-slate-400 resize-none shadow-2xs"
                        />

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveReviewItemId(null)}
                            className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                          >
                            {t("detailsModal.cancel")}
                          </button>
                          <button
                            type="button"
                            disabled={
                              submittingItemId === item.id ||
                              !(comments[item.id] || "").trim()
                            }
                            onClick={() => handleSubmitItemReview(item)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#D81B60] hover:bg-[#C2185B] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {submittingItemId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {submittingItemId === item.id
                                ? t("detailsModal.submitting")
                                : t("detailsModal.submitReview")}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-xs text-rose-800 font-extrabold flex items-center gap-1.5 justify-center sm:justify-start">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>SRIBEES Express Delivery Guarantee Applied</span>
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Tax Invoice Generated • All prices include VAT
              </p>
            </div>

            <div className="w-full sm:w-auto text-right space-y-1 text-xs">
              <div className="flex items-center justify-between sm:justify-end gap-6 text-slate-500 font-medium">
                <span>{t("detailsModal.subtotal")}:</span>
                <span>{formatLKR(order.total - 150)}</span>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 text-slate-500 font-medium">
                <span>{t("detailsModal.deliveryFee")}:</span>
                <span className="text-emerald-600 font-bold">LKR 150</span>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 text-base font-black text-slate-900 pt-1 border-t border-rose-200">
                <span>{t("detailsModal.totalAmount")}:</span>
                <span className="text-[#D81B60]">{formatLKR(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-all cursor-pointer"
          >
            {t("detailsModal.keepOrder") ? "Close" : "Close"}
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {canCancelOrder && !showCancelConfirm && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelOrderMutation.isPending}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Ban className="w-4 h-4 text-rose-600" />
                <span>{t("detailsModal.cancelOrder")}</span>
              </button>
            )}

            {isConfirmedOrder && (
              <button
                onClick={handleDownloadInvoice}
                disabled={downloadInvoiceMutation.isPending}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-[#D81B60] hover:border-rose-200 text-slate-700 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200 disabled:opacity-50"
              >
                {downloadInvoiceMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#D81B60]" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>
                  {downloadInvoiceMutation.isPending
                    ? t("detailsModal.downloading")
                    : t("detailsModal.downloadInvoice")}
                </span>
              </button>
            )}

            {onRequestReturn &&
              (order.category === "previous" ||
                order.statusType === "delivered") &&
              ![
                "return_requested",
                "return_approved",
                "return_rejected",
                "refunded",
              ].includes((order.rawOrder?.status || "").toLowerCase()) && (
                <button
                  onClick={() => {
                    onRequestReturn(order);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-[#D81B60] border border-rose-200 rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-4 h-4 text-[#D81B60]" />
                  <span>{t("detailsModal.requestReturn")}</span>
                </button>
              )}

            {onTrackOrder && (
              <button
                onClick={() => {
                  onTrackOrder(order);
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Navigation className="w-4 h-4" />
                <span>{t("detailsModal.trackOrder")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Popup Overlay Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 tracking-tight">
                  {t("detailsModal.cancelConfirmTitle")}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {t("card.orderId")} #{order.id}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {t("detailsModal.cancelConfirmDesc")}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelOrderMutation.isPending}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-all cursor-pointer"
              >
                {t("detailsModal.keepOrder")}
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelOrderMutation.isPending}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {cancelOrderMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Ban className="w-4 h-4" />
                )}
                <span>
                  {cancelOrderMutation.isPending ? t("detailsModal.cancelling") : t("detailsModal.yesCancel")}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
