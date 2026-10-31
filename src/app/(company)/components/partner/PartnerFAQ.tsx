"use client";

import { useState } from "react";
import { Container } from "../base";

const faqs = [
  {
    question: 'When and how do I receive my commission payouts?',
    answer: 'Commissions are calculated on all completed grocery orders and paid out monthly via direct Sri Lankan bank transfer or online wallet once your account reaches the minimum threshold of LKR 1,000.',
  },
  {
    question: 'How does the 30-day tracking cookie work?',
    answer: 'When a customer clicks your unique partner referral link, a tracking cookie is saved on their browser for 30 days. Any purchase they place on SRIBEES Online within that 30-day window automatically attributes 2%–3% commission to your account.',
  },
  {
    question: 'Is there a minimum payout threshold?',
    answer: 'Yes, the minimum balance required for payout processing is LKR 1,000. Balances below this threshold roll over into the next monthly billing cycle automatically.',
  },
  {
    question: 'What promo guidelines or terms should I follow?',
    answer: 'You are welcome to promote SRIBEES on social media (Facebook, Instagram, TikTok, WhatsApp groups), blogs, and personal networks. However, spamming, posting misleading discount claims, or bidding on trademarked "SRIBEES" keywords in paid search engines is strictly prohibited.',
  },
];

export function PartnerFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
<section id="partner-faq" className="py-16 sm:py-20 bg-gradient-to-b from-white via-pink-50/20 to-slate-50/60 relative overflow-hidden">
  
  <div className="absolute top-1/2 left-10 -translate-y-1/2 w-96 h-96 bg-pink-100/40 rounded-full blur-3xl pointer-events-none -z-10"></div>

  <Container size="xl">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
      
      
      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100/80 border border-pink-200 text-[#D81B60] text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#D81B60] animate-pulse"></span>
          <span>QUESTIONS & ANSWERS</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          Partner Frequently Asked Questions
        </h2>

        <p className="text-slate-600 text-base font-normal leading-relaxed">
          Everything you need to know about the SRIBEES Partner Engine, payout cycles, link tracking, and promotional terms.
        </p>


      </div>

      
      <div className="lg:col-span-7 space-y-4">
        {
          faqs.map((faq, index) => (
            <div key={faq.question} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:border-pink-300 hover:shadow-md">
              <button
                type="button"
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer group"
                aria-expanded={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-[#D81B60] transition-colors pr-4">
                  {faq.question}
                </span>
                <div className="w-8 h-8 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0 group-hover:bg-[#D81B60] transition-colors">
                  <svg className={`w-4 h-4 text-[#D81B60] group-hover:text-white transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 pt-1 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100/80">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))
        }
      </div>

    </div>
  </Container>
</section>
    </>
  );
}
