"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/base/Modal";
import { Copy, Check, Share2, QrCode, Download } from "lucide-react";
import { useToastStore } from "@/state/toast.store";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatImageUrl } from "@/utils/formatImageUrl";
import QRCode from "qrcode";

export interface ShareProductInfo {
  title: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  discountPercent?: number;
  category?: string;
}

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  shareUrl?: string;
  product?: ShareProductInfo;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title = "Share Product",
  shareUrl,
  product,
}) => {
  const addToast = useToastStore((state) => state.addToast);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [currentUrl, setCurrentUrl] = useState<string>(shareUrl || "");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = shareUrl || window.location.href;
      setCurrentUrl(url);
    }
  }, [shareUrl, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setShowQr(false);
      setCopied(false);
      return;
    }

    if (currentUrl) {
      QRCode.toDataURL(currentUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error("Error generating QR code:", err));
    }
  }, [currentUrl, isOpen]);

  const handleCopyLink = async () => {
    if (!currentUrl) return;

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      addToast({
        title: "Link Copied!",
        message: "Product link copied to clipboard.",
        type: "success",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addToast({
        title: "Copy Failed",
        message: "Failed to copy link to clipboard.",
        type: "error",
      });
    }
  };

  const productTitle = product?.title || "this product";
  const formattedPrice =
    product?.price !== undefined ? formatCurrency(product.price) : "";

  const handleWhatsAppShare = () => {
    const text = `Check out ${productTitle} on SriBees Online!${
      formattedPrice ? `\nPrice: ${formattedPrice}` : ""
    }\n${currentUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: productTitle,
          text: `Check out ${productTitle} on SriBees Online!${
            formattedPrice ? ` (${formattedPrice})` : ""
          }`,
          url: currentUrl,
        });
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-5 font-sans">
        {/* Product Preview Card */}
        {product && (
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <img
              src={formatImageUrl(product.image)}
              alt={product.title}
              className="w-16 h-16 rounded-xl object-cover border border-slate-200/80 bg-white shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400";
              }}
            />
            <div className="flex-1 min-w-0">
              {product.category && (
                <span className="text-2xs font-bold text-slate-600 uppercase tracking-wider block truncate">
                  {product.category}
                </span>
              )}
              <h4 className="text-sm font-bold text-slate-900 truncate leading-snug">
                {product.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {product.price !== undefined && (
                  <span className="text-sm font-black text-[#D81B60]">
                    {formatCurrency(product.price)}
                  </span>
                )}
                {product.originalPrice &&
                  product.originalPrice > (product.price || 0) && (
                    <span className="text-xs text-slate-600 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  )}
                {product.discountPercent && product.discountPercent > 0 && (
                  <span className="text-2xs font-bold text-white bg-[#D81B60] px-1.5 py-0.5 rounded-full">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Share Options: WhatsApp, QR Code, More */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Share Instantly Via
          </p>
          <div className="grid grid-cols-3 gap-3">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer border border-emerald-100/80 group shadow-xs"
              title="Share to WhatsApp"
            >
              <img
                src="/base/whatsapp.png"
                alt="WhatsApp"
                className="w-7 h-7 object-contain transition-transform group-hover:scale-110"
              />
              <span className="text-xs font-bold">WhatsApp</span>
            </button>

            {/* QR Code */}
            <button
              onClick={() => setShowQr(!showQr)}
              className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl transition-all cursor-pointer border group shadow-xs ${
                showQr
                  ? "bg-rose-50 text-[#D81B60] border-rose-200 ring-1 ring-rose-200"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80"
              }`}
              title="QR Code"
            >
              <div className="w-7 h-7 flex items-center justify-center">
                <QrCode
                  className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                    showQr ? "text-[#D81B60]" : "text-slate-700"
                  }`}
                />
              </div>
              <span className="text-xs font-bold">
                {showQr ? "Hide QR" : "QR Code"}
              </span>
            </button>

            {/* More */}
            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#D81B60]/10 hover:bg-[#D81B60]/15 text-[#D81B60] transition-all cursor-pointer border border-[#D81B60]/20 group shadow-xs"
              title="More Share Options"
            >
              <div className="w-7 h-7 flex items-center justify-center">
                <Share2 className="w-6 h-6 text-[#D81B60] transition-transform group-hover:scale-110" />
              </div>
              <span className="text-xs font-bold">More</span>
            </button>
          </div>
        </div>

        {/* QR Code Section (Collapsible) */}
        {showQr && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center space-y-3 animate-fadeIn">
            <p className="text-xs font-semibold text-slate-600">
              Scan with phone camera to open product
            </p>
            {qrCodeDataUrl ? (
              <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200">
                <img
                  src={qrCodeDataUrl}
                  alt="Product QR Code"
                  className="w-44 h-44 object-contain"
                />
              </div>
            ) : (
              <div className="w-44 h-44 bg-slate-200 animate-pulse rounded-xl" />
            )}
            {qrCodeDataUrl && (
              <a
                href={qrCodeDataUrl}
                download={`${(product?.title || "product").replace(
                  /[^a-zA-Z0-9]/g,
                  "_"
                )}_qr.png`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D81B60] hover:underline cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download QR Image</span>
              </a>
            )}
          </div>
        )}

        {/* Copy Link Section */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Or Copy Link
          </label>
          <div className="flex items-center gap-2 p-1.5 pl-3 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-[#D81B60] focus-within:ring-2 focus-within:ring-[#D81B60]/10 transition-all">
            <input
              type="text"
              readOnly
              value={currentUrl}
              onFocus={(e) => e.target.select()}
              className="flex-1 bg-transparent text-xs text-slate-700 font-medium outline-hidden truncate selection:bg-rose-100"
            />
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs ${
                copied
                  ? "bg-emerald-600 text-white shadow-emerald-200"
                  : "bg-[#D81B60] hover:bg-rose-700 text-white shadow-rose-200"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
