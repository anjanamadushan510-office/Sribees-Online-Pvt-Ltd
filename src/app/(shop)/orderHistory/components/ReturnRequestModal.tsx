"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { OrderRecord, ReturnOrderPayload } from "@/interfaces/order.interface";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useUploadReturnImage, useRequestReturn } from "@/api/queries/useOrders";
import { useToastStore } from "@/state/toast.store";
import { useTranslations } from "next-intl";

interface ReturnRequestModalProps {
  order: OrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  useBodyScrollLock(isOpen);
  const t = useTranslations("orderHistory");
  const addToast = useToastStore((state) => state.addToast);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = useUploadReturnImage();
  const requestReturnMutation = useRequestReturn();

  // Form State
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [uploadedPhotos, setUploadedPhotos] = useState<
    Array<{ path: string; url: string }>
  >([]);
  const [selectedItemQuantities, setSelectedItemQuantities] = useState<
    Record<string, number>
  >({});
  const [isWholeOrder, setIsWholeOrder] = useState<boolean>(true);

  // Countdown timer for 12h return window
  const [windowRemaining, setWindowRemaining] = useState<string | null>(null);
  const [isWindowExpired, setIsWindowExpired] = useState<boolean>(false);

  // Initialize and sync item quantities on open
  useEffect(() => {
    if (isOpen && order) {
      const initialMap: Record<string, number> = {};
      const rawItems = order.rawOrder?.items || [];

      if (rawItems.length > 0) {
        rawItems.forEach((item) => {
          const key = item.order_item_id || item.product_id;
          if (item.is_returnable !== false) {
            initialMap[key] = item.quantity;
          }
        });
      } else {
        // Fallback to order.items
        (order.items || []).forEach((item) => {
          const key = item.orderItemId || item.id;
          if (item.isReturnable !== false) {
            initialMap[key] = item.quantity;
          }
        });
      }

      setSelectedItemQuantities(initialMap);
      setIsWholeOrder(true);
      setSelectedReason("");
      setComments("");
      setUploadedPhotos([]);
    }
  }, [isOpen, order]);

  // Window expiry calculation
  useEffect(() => {
    if (!isOpen || !order) return;

    const expiresAt =
      order.rawOrder?.return_window_expires_at || order.returnWindowExpiresAt;
    if (!expiresAt) {
      setWindowRemaining(null);
      setIsWindowExpired(false);
      return;
    }

    const checkWindow = () => {
      const diffMs = new Date(expiresAt).getTime() - Date.now();
      if (diffMs <= 0) {
        setIsWindowExpired(true);
        setWindowRemaining(null);
      } else {
        setIsWindowExpired(false);
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setWindowRemaining(`${hours}h ${minutes}m`);
      }
    };

    checkWindow();
    const interval = setInterval(checkWindow, 60000);
    return () => clearInterval(interval);
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const targetOrderId = order.orderId || order.rawOrder?.order_id || order.id;

  // Handle Photo File Select & Upload (Step 1)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedPhotos.length >= 4) {
      addToast({
        title: "Photo Limit Reached",
        message: "You can upload a maximum of 4 photos per return request.",
        type: "warning",
      });
      return;
    }

    const file = files[0];
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast({
        title: "File Too Large",
        message: "Please select an image smaller than 5 MB.",
        type: "error",
      });
      return;
    }

    // Check file type (JPEG, PNG, WebP)
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      addToast({
        title: "Invalid Format",
        message: "Only JPEG, PNG or WebP images are accepted.",
        type: "error",
      });
      return;
    }

    try {
      const res = await uploadImageMutation.mutateAsync({
        id: targetOrderId,
        file,
      });
      if (res?.path) {
        setUploadedPhotos((prev) => [
          ...prev,
          { path: res.path, url: res.url || res.path },
        ]);
      }
    } catch {
      // Error toast is handled in mutation
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleToggleItem = (itemId: string, maxQty: number) => {
    setSelectedItemQuantities((prev) => {
      const current = prev[itemId] || 0;
      const next = { ...prev };
      if (current > 0) {
        delete next[itemId];
      } else {
        next[itemId] = maxQty;
      }
      return next;
    });
  };

  const handleQuantityChange = (itemId: string, newQty: number, maxQty: number) => {
    const clamped = Math.max(1, Math.min(newQty, maxQty));
    setSelectedItemQuantities((prev) => ({
      ...prev,
      [itemId]: clamped,
    }));
  };

  // Submit Request (Step 2)
  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isWindowExpired) {
      addToast({
        title: "Return Window Expired",
        message: "The 12-hour return window for this order has expired.",
        type: "error",
      });
      return;
    }

    if (!selectedReason.trim()) {
      addToast({
        title: "Reason Required",
        message: "Please select a reason for returning the items.",
        type: "warning",
      });
      return;
    }

    if (uploadedPhotos.length === 0) {
      addToast({
        title: "Photo Required",
        message: "Please upload at least 1 photo of the goods as proof.",
        type: "warning",
      });
      return;
    }

    // Build items payload
    const rawItems = order.rawOrder?.items || [];
    const returnableItems = rawItems.filter((i) => i.is_returnable !== false);
    const selectedEntries = Object.entries(selectedItemQuantities).filter(
      ([_, qty]) => qty > 0,
    );

    if (!isWholeOrder && selectedEntries.length === 0) {
      addToast({
        title: "Select Items",
        message: "Please select at least one item to return.",
        type: "warning",
      });
      return;
    }

    const itemsPayload =
      !isWholeOrder && selectedEntries.length > 0
        ? selectedEntries.map(([order_item_id, quantity]) => ({
            order_item_id,
            quantity,
          }))
        : undefined;

    const payload: ReturnOrderPayload = {
      reason: selectedReason,
      comments: comments.trim() ? comments.trim() : undefined,
      images: uploadedPhotos.map((p) => p.path),
      items: itemsPayload,
    };

    try {
      await requestReturnMutation.mutateAsync({
        id: targetOrderId,
        payload,
      });
      onSuccess?.();
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  // Preset reasons
  const reasonOptions = [
    { key: "damaged", label: t("returnModal.reasons.damaged") },
    { key: "wrong", label: t("returnModal.reasons.wrong") },
    { key: "expired", label: t("returnModal.reasons.expired") },
    { key: "quality", label: t("returnModal.reasons.quality") },
    { key: "other", label: t("returnModal.reasons.other") },
  ];

  const rawOrderItems = order.rawOrder?.items || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scaleIn">
        {/* Header */}
        <div className="bg-slate-50/90 border-b border-slate-200/80 px-5 sm:px-6 py-4 flex items-center justify-between gap-3 shrink-0">
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="p-1.5 bg-rose-100/80 rounded-xl text-[#BE185D]">
                <RotateCcw className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {t("returnModal.title")}
              </h3>
              <span className="text-xs font-black text-[#D81B60] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                #{order.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {t("returnModal.subtitle")}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Window Countdown Banner */}
        {windowRemaining && (
          <div className="bg-amber-50 border-b border-amber-200/70 px-5 py-2.5 flex items-center gap-2 text-amber-800 text-xs font-semibold shrink-0">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {t("returnModal.windowCountdown")}:{" "}
              <strong className="font-extrabold text-amber-900">
                {windowRemaining}
              </strong>
            </span>
          </div>
        )}

        {isWindowExpired && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 flex items-center gap-2 text-rose-800 text-xs font-semibold shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{t("returnModal.windowClosed")}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmitReturn}
          className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5"
        >
          {/* Section 1: Item Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                1. {t("returnModal.selectItems")}
              </label>

              <button
                type="button"
                onClick={() => setIsWholeOrder(!isWholeOrder)}
                className="text-xs font-bold text-[#D81B60] hover:underline cursor-pointer"
              >
                {isWholeOrder
                  ? "Select specific items"
                  : t("returnModal.selectAll")}
              </button>
            </div>

            {isWholeOrder ? (
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Returning all eligible items in order ({order.itemsCount} items)</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {rawOrderItems.map((item, idx) => {
                  const key = item.order_item_id || item.product_id || `item-${idx}`;
                  const isChecked = Boolean(selectedItemQuantities[key]);
                  const currentQty = selectedItemQuantities[key] || 1;
                  const isReturnable = item.is_returnable !== false;

                  return (
                    <div
                      key={key}
                      className={`rounded-2xl p-3 border transition-colors flex items-center justify-between gap-3 ${
                        !isReturnable
                          ? "bg-slate-100/50 border-slate-200 opacity-60"
                          : isChecked
                            ? "bg-rose-50/40 border-rose-200"
                            : "bg-white border-slate-200 hover:bg-slate-50/60"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          disabled={!isReturnable}
                          checked={isChecked}
                          onChange={() => handleToggleItem(key, item.quantity)}
                          className="w-4 h-4 rounded text-[#D81B60] focus:ring-[#D81B60] border-slate-300 cursor-pointer"
                        />
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-10 h-10 object-cover rounded-xl border border-slate-200 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {item.product_name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Qty: {item.quantity}{" "}
                            {!isReturnable && "• Non-returnable"}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controller if checked */}
                      {isChecked && isReturnable && item.quantity > 1 && (
                        <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                key,
                                currentQty - 1,
                                item.quantity,
                              )
                            }
                            disabled={currentQty <= 1}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded text-xs font-bold disabled:opacity-30 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-xs font-black w-4 text-center text-slate-900">
                            {currentQty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleQuantityChange(
                                key,
                                currentQty + 1,
                                item.quantity,
                              )
                            }
                            disabled={currentQty >= item.quantity}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded text-xs font-bold disabled:opacity-30 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Reason for Return */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
              2. {t("returnModal.reasonLabel")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {reasonOptions.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSelectedReason(opt.label)}
                  className={`text-left p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedReason === opt.label
                      ? "bg-rose-50 border-[#D81B60] text-[#D81B60] shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Comments (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
              3. {t("returnModal.commentsLabel")}{" "}
              <span className="text-slate-400 font-normal lowercase">
                (optional)
              </span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={t("returnModal.commentsPlaceholder")}
              rows={2}
              maxLength={500}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 transition-all resize-none"
            />
          </div>

          {/* Section 4: Proof Photos (Required: 1 to 4) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
                4. {t("returnModal.uploadPhotos")}
              </label>
              <span className="text-[11px] font-bold text-slate-500">
                {uploadedPhotos.length}/4 {t("returnModal.photosCount")}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {t("returnModal.uploadHint")}
            </p>

            <div className="flex items-center gap-2.5 flex-wrap pt-1">
              {/* Photo Previews */}
              {uploadedPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group bg-slate-100"
                >
                  <img
                    src={photo.url}
                    alt={`Proof ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Add Photo Button */}
              {uploadedPhotos.length < 4 && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadImageMutation.isPending}
                    className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#D81B60] hover:bg-rose-50/40 transition-colors flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-[#D81B60] cursor-pointer disabled:opacity-50"
                  >
                    {uploadImageMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#D81B60]" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        <span className="text-[10px] font-bold">Add Photo</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={requestReturnMutation.isPending}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isWindowExpired ||
                !selectedReason ||
                uploadedPhotos.length === 0 ||
                requestReturnMutation.isPending ||
                uploadImageMutation.isPending
              }
              className="px-5 py-2 bg-[#BE185D] hover:bg-[#9D174D] text-white font-extrabold text-xs rounded-full shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              {requestReturnMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              <span>
                {requestReturnMutation.isPending
                  ? t("returnModal.submitting")
                  : t("returnModal.submitBtn")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
