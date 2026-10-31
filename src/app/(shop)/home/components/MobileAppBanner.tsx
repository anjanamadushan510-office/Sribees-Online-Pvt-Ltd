"use client";

import React, { useState, useEffect } from "react";
import { Smartphone, CheckCircle2, QrCode, ExternalLink, Copy, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import QRCode from "qrcode";
import { Modal } from "@/components/base/Modal";
import { PLAYSTORE_LINK } from "@/constants/links";
import { useToastStore } from "@/state/toast.store";

export const MobileAppBanner: React.FC = () => {
  const t = useTranslations("home.mobileApp");
  const addToast = useToastStore((state) => state.addToast);

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(PLAYSTORE_LINK, {
      width: 260,
      margin: 2,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error("Error generating app QR code:", err));
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(PLAYSTORE_LINK);
      setCopiedLink(true);
      addToast({
        title: "Link Copied!",
        message: "Play Store link copied to clipboard.",
        type: "success",
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      addToast({
        title: "Copy Failed",
        message: "Could not copy link to clipboard.",
        type: "error",
      });
    }
  };

  const handleAppStoreClick = () => {
    addToast({
      title: "iOS App Coming Soon",
      message:
        "The Apple iOS version of SRIBEES is currently in review. Please download on Google Play Store!",
      type: "info",
    });
  };

  return (
    <>
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative rounded-3xl bg-gradient-to-br from-rose-50 via-pink-50/50 to-rose-100/40 border border-rose-200/60 p-6 md:p-12 overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-rose-200 text-[#D81B60] text-[10px] font-black uppercase tracking-wider shadow-2xs">
                <Smartphone className="w-3.5 h-3.5" />
                <span>{t("badge")}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {t("titlePart1")} <br />
                <span className="text-[#D81B60]">{t("titleHighlight")}</span>{" "}
                {t("titlePart2")}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
                {t("description")}
              </p>

              {/* Checklist */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#D81B60] shrink-0 mt-0.5" />
                  <span>
                    {t("featureDelivery")}{" "}
                    <strong>{t("deliveryBrand")}</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#D81B60] shrink-0 mt-0.5" />
                  <span>
                    {t("featurePromo")}{" "}
                    <strong className="bg-rose-100 px-1.5 py-0.5 rounded text-[#D81B60]">
                      {t("promoCode")}
                    </strong>{" "}
                    {t("promoDiscount")}
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#D81B60] shrink-0 mt-0.5" />
                  <span>{t("featurePayments")}</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#D81B60] shrink-0 mt-0.5" />
                  <span>{t("featureAiAssistant")}</span>
                </div>
              </div>

              {/* App Store Buttons & QR */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Google Play Store Link */}
                <a
                  href={PLAYSTORE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer group"
                  title="Download SRIBEES App on Google Play"
                >
                  <img
                    src="/base/playstore.png"
                    alt="Google Play"
                    className="w-5 h-5 object-contain group-hover:scale-110 transition-transform"
                  />
                  <div className="text-left">
                    <div className="text-[9px] font-semibold text-slate-300 uppercase leading-none">
                      {t("getItOn")}
                    </div>
                    <div className="text-xs font-bold leading-tight">
                      {t("googlePlay")}
                    </div>
                  </div>
                </a>

                {/* App Store Button (Coming soon) */}
                <button
                  type="button"
                  onClick={handleAppStoreClick}
                  className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/85 hover:bg-slate-900 text-white rounded-xl transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                  title="Download SRIBEES on App Store (Coming Soon)"
                >
                  <img
                    src="/base/appstore.png"
                    alt="App Store"
                    className="w-5 h-5 object-contain"
                  />
                  <div className="text-left">
                    <div className="text-[9px] font-semibold text-slate-300 uppercase leading-none">
                      {t("downloadOn")}
                    </div>
                    <div className="text-xs font-bold leading-tight">
                      {t("appStore")}
                    </div>
                  </div>
                </button>

                {/* QR Code Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="flex items-center gap-2 bg-white hover:bg-rose-50/50 p-2 rounded-xl border border-rose-200/80 hover:border-rose-300 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                  title="Click to view QR code to scan with your phone"
                >
                  <QrCode className="w-7 h-7 text-[#D81B60] group-hover:scale-110 transition-transform shrink-0" />
                  <div className="text-left">
                    <div className="text-[9px] font-extrabold text-[#D81B60] uppercase">
                      {t("scanQr")}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <span>Instant Install</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover:text-[#D81B60]" />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Phone Mockup */}
            <div className="lg:col-span-5 flex justify-center relative">
              <a
                href={PLAYSTORE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="group block cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                title="Download SRIBEES Mobile App on Google Play"
              >
                <img
                  src="/base/mainmock.png"
                  alt="SRIBEES Mobile App"
                  className="w-full h-full object-cover drop-shadow-xl"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* QR Code Modal for Mobile App Installation */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Download SRIBEES App"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="SRIBEES Google Play QR Code"
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center bg-slate-100 rounded-lg animate-pulse text-xs text-slate-400">
                Generating QR code...
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-900">
              Scan with Your Phone Camera
            </h4>
            <p className="text-xs text-slate-500 max-w-xs">
              Point your smartphone camera at the QR code above to open and install SRIBEES directly from the Google Play Store.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full pt-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <a
              href={PLAYSTORE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-[#D81B60] hover:bg-[#C2185B] text-white text-xs font-bold rounded-xl shadow-md shadow-rose-200 transition-all cursor-pointer"
            >
              <span>Open Play Store</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
};
