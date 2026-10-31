"use client";

import { useCompanyDialog } from "./useCompanyDialog";

export function TermsModal() {
  const { isOpen, close, onBackdropClick } = useCompanyDialog("terms");

  if (!isOpen) return null;

  return (
    <>
<div
  onClick={onBackdropClick}
  className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto"
  role="dialog"
  aria-modal="true"
  aria-labelledby="terms-modal-title"
>
  
  <div 
    className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-pink-100 flex flex-col max-h-[88vh] overflow-hidden my-auto"
  >
    
    <div className="h-1.5 w-full bg-gradient-to-r from-[#D81B60] via-[#FF3385] to-[#D81B60]"></div>

    
    <div className="px-6 sm:px-8 py-5 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#D81B60] flex items-center justify-center shrink-0 shadow-sm border border-pink-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 id="terms-modal-title" className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight leading-tight">
            Terms & Conditions
          </h2>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            SRIBEES Online • Last Updated: September 2026
          </p>
        </div>
      </div>

      
      <button 
        onClick={close}
        type="button"
        className="text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#D81B60]/50"
        aria-label="Close Terms modal"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    
    <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-zinc-600 text-sm leading-relaxed grow divide-y divide-zinc-100">
      
      
      <div className="pt-0 space-y-2">
        <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D81B60]"></span>
          1. Agreement to Terms
        </h3>
        <p>
          Welcome to <strong className="text-zinc-800">SRIBEES Online</strong>. By accessing or using our website, mobile application, or grocery network services, you agree to be bound by these Terms & Conditions. If you do not agree to all terms outlined here, please refrain from using our services.
        </p>
      </div>

      
      <div className="pt-6 space-y-2">
        <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D81B60]"></span>
          2. Platform Services & Direct Sourcing
        </h3>
        <p>
          SRIBEES Online operates a virtual grocery network connecting Sri Lankan households directly with verified local farmers, producers, and suppliers. We guarantee:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-zinc-600">
          <li><strong>Zero Broker Markup:</strong> Direct farmer-to-consumer pricing transparently passed to buyers.</li>
          <li><strong>Quality Guarantee:</strong> Fresh produce harvested and packed with high standards of sanitation.</li>
          <li><strong>Real-time Matching:</strong> Automated logistics routing orders to the nearest local supplier within 30 minutes.</li>
        </ul>
      </div>

      
      <div className="pt-6 space-y-2">
        <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D81B60]"></span>
          3. User Accounts & Responsibilities
        </h3>
        <p>
          To place orders or participate in the SRIBEES Partner Engine program, users must create an account providing accurate, complete, and current information. You are solely responsible for maintaining the confidentiality of your credentials and all activities occurring under your account.
        </p>
      </div>

      
      <div className="pt-6 space-y-2">
        <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D81B60]"></span>
          4. Ordering, Pricing & Payments
        </h3>
        <p>
          All product prices are displayed in Sri Lankan Rupees (LKR) and include applicable taxes unless otherwise noted. Payments can be processed via major credit/debit cards, digital wallets, or Cash on Delivery (COD) where available.
        </p>
        <p>
          We reserve the right to refuse or cancel any order if items are out of stock or if fraudulent activity is suspected. In case of pre-paid cancelled orders, refunds will be issued to the original payment method within 3–5 business days.
        </p>
      </div>

      
      <div className="pt-6 space-y-2">
        <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D81B60]"></span>
          5. Partner & Affiliate Program Terms
        </h3>
        <p>
          Affiliates participating in the <em>SRIBEES Partner Engine</em> earn 2%–3% lifetime recurring commission on valid customer orders linked via their unique referral URL. Commissions are calculated on net order value excluding delivery fees and taxes. Payouts are made monthly subject to reaching the minimum threshold of LKR 1,000.
        </p>
      </div>

      
      <div className="pt-6 space-y-2">
        <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D81B60]"></span>
          6. Returns & Quality Claims
        </h3>
        <p>
          If you receive damaged, incorrect, or sub-standard fresh produce, please notify customer support within 24 hours of delivery with photos of the affected items. SRIBEES Online will provide an immediate replacement or full credit refund.
        </p>
      </div>

      
      <div className="pt-6 space-y-2">
        <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D81B60]"></span>
          7. Intellectual Property & Governing Law
        </h3>
        <p>
          All trademarks, logos, content, and software on SRIBEES Online belong to SRIBEES Online. These terms are governed by and construed in accordance with the laws of Sri Lanka.
        </p>
      </div>

      
      <div className="pt-6 space-y-2">
        <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D81B60]"></span>
          8. Contact Information
        </h3>
        <p>
          If you have any questions regarding these Terms & Conditions, please contact us at:
          <a href="mailto:support@sribeesonline.com" className="text-[#D81B60] hover:underline font-medium ml-1">support@sribeesonline.com</a>.
        </p>
      </div>

    </div>

    
    <div className="px-6 sm:px-8 py-4 bg-zinc-50 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
      <p className="text-xs text-zinc-500 font-medium text-center sm:text-left">
        By continuing to use our platform, you accept these terms.
      </p>
      <button 
        onClick={close}
        type="button"
        className="w-full sm:w-auto px-6 py-2.5 bg-[#D81B60] hover:bg-[#C2185B] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#D81B60]/50 active:scale-[0.98]"
      >
        I Understand & Accept
      </button>
    </div>
  </div>
</div>
    </>
  );
}
