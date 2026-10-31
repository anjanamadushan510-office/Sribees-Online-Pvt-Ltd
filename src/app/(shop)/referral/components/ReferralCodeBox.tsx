"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Share2, QrCode, Sparkles } from "lucide-react";
import { useToastStore } from "@/state/toast.store";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";

interface ReferralCodeBoxProps {
  referralCode: string;
  referralLink: string;
}

export const ReferralCodeBox: React.FC<ReferralCodeBoxProps> = ({
  referralCode,
  referralLink,
}) => {
  const t = useTranslations("referral");
  const addToast = useToastStore((state) => state.addToast);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  useEffect(() => {
    if (!referralLink) {
      setQrCodeDataUrl("");
      return;
    }

    QRCode.toDataURL(referralLink, {
      width: 240,
      margin: 2,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    })
      .then((dataUrl: string) => {
        setQrCodeDataUrl(dataUrl);
      })
      .catch((err: unknown) => {
        console.warn("Failed to generate local QR code:", err);
      });
  }, [referralLink]);

  const shareText = `Use my SriBees referral code "${referralCode}" or click the link to get 10% OFF on your first grocery purchase! Link: ${referralLink}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      addToast({
        title: "Code Copied!",
        message: `Referral code "${referralCode}" copied to clipboard.`,
        type: "success",
      });
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      addToast({
        title: "Copy Failed",
        message: "Failed to copy code to clipboard.",
        type: "error",
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      addToast({
        title: "Link Copied!",
        message: "Referral invite link copied to clipboard.",
        type: "success",
      });
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      addToast({
        title: "Copy Failed",
        message: "Failed to copy link to clipboard.",
        type: "error",
      });
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
    window.open(url, "_blank");
  };

  const handleTikTokShare = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${referralLink}`);
      addToast({
        title: "Link Copied for TikTok!",
        message:
          "Invite text and link copied! Paste it in TikTok messages or bio.",
        type: "success",
      });
      window.open("https://www.tiktok.com", "_blank");
    } catch {
      window.open("https://www.tiktok.com", "_blank");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "SriBees Invite & Discount",
          text: shareText,
          url: referralLink,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 text-xs font-bold text-[#D81B60]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("codeBox.yourCode")}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900">
            {t("codeBox.shareLink")}
          </h2>
        </div>
        <button
          onClick={() => setShowQRModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-rose-50 text-[#D81B60] text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">QR Code</span>
        </button>
      </div>

      {/* Referral Code Box & Copy Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        {/* Code Box */}
        <div className="sm:col-span-7 bg-slate-50 rounded-2xl p-4 border border-dashed border-rose-300 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t("codeBox.yourCode")}
            </p>
            <p className="text-xl sm:text-2xl font-black tracking-widest text-[#D81B60]">
              {referralCode}
            </p>
          </div>
          <button
            onClick={handleCopyCode}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              copiedCode
                ? "bg-emerald-600 text-white"
                : "bg-[#D81B60] text-white hover:bg-rose-700"
            }`}
          >
            {copiedCode ? (
              <>
                <Check className="w-4 h-4" />
                <span>{t("codeBox.copied")}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{t("codeBox.copyLink")}</span>
              </>
            )}
          </button>
        </div>

        {/* Invite Link Box */}
        <div className="sm:col-span-5 bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Personal Invite Link
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-mono focus:outline-hidden"
            />
            <button
              onClick={handleCopyLink}
              className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                copiedLink
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {copiedLink ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Direct Social Sharing Bar */}
      <div className="space-y-3 pt-2">
        <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
          Share Instantly Via
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-200 transition-all cursor-pointer"
          >
            <img
              src="/base/whatsapp.png"
              alt="WhatsApp"
              className="w-5 h-5 object-contain"
            />
            <span>WhatsApp</span>
          </button>

          {/* Facebook */}
          <button
            onClick={handleFacebookShare}
            className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all cursor-pointer"
          >
            <img
              src="/base/facebook.png"
              alt="Facebook"
              className="w-5 h-5 object-contain"
            />
            <span>Facebook</span>
          </button>

          {/* TikTok */}
          <button
            onClick={handleTikTokShare}
            className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-black hover:bg-slate-900 text-white text-xs font-bold shadow-md shadow-slate-300 transition-all cursor-pointer"
          >
            <img
              src="/base/tik-tok.png"
              alt="TikTok"
              className="w-5 h-5 object-contain"
            />
            <span>TikTok</span>
          </button>

          {/* More */}
          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2.5 p-3 rounded-2xl bg-[#D81B60] hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition-all cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
            <span>More</span>
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl relative">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
            <h3 className="text-lg font-black text-slate-900">
              Scan to Invite
            </h3>
            <p className="text-xs text-slate-500">
              Scan this QR code with a mobile camera to open your personal
              invite link instantly.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block min-w-[200px] min-h-[200px] flex items-center justify-center">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Referral QR Code"
                  className="w-48 h-48 mx-auto object-contain rounded-xl"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400 font-semibold">
                  Generating QR code...
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-[#D81B60]">
              Code: {referralCode}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
