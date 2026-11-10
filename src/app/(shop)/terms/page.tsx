import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Terms & Conditions | SRIBEES Online",
  description:
    "The terms for buying from SRIBEES Online on the website and mobile app: accounts, orders, payments, delivery, cancellations, refunds and returns.",
};

const LAST_UPDATED = "10 November 2026";

interface Section {
  title: string;
  body: React.ReactNode;
}

const policyLink = (href: string, label: string) => (
  <Link href={href} className="text-[#D81B60] font-semibold hover:underline">
    {label}
  </Link>
);

const SECTIONS: Section[] = [
  {
    title: "Who we are",
    body: (
      <p>
        SRIBEES Online (www.sribeesonline.com and the Sribees Online mobile app) is an online
        grocery store operated by Sribees Lanka (Pvt) Ltd in Sri Lanka. In these terms,
        &quot;we&quot; and &quot;us&quot; mean SRIBEES Online, and &quot;you&quot; means the
        person using the store. You can reach us at{" "}
        <a href="mailto:support@sribeesonline.com" className="text-[#D81B60] font-semibold hover:underline">
          support@sribeesonline.com
        </a>
        .
      </p>
    ),
  },
  {
    title: "Accepting these terms",
    body: (
      <p>
        By creating an account or placing an order you agree to these terms, to our{" "}
        {policyLink(ROUTES.PRIVACY_POLICY, "Privacy Policy")} and to our{" "}
        {policyLink(ROUTES.RETURN_POLICY, "Return & Refund Policy")}. If you do not agree,
        please do not use the store.
      </p>
    ),
  },
  {
    title: "Your account",
    body: (
      <ul>
        <li>You register with your mobile number. The details you give us, including your name, NIC and addresses, must be true and your own.</li>
        <li>Each NIC can belong to only one active account.</li>
        <li>You are responsible for activity on your account. Tell us at once if you think someone else is using it.</li>
        <li>You can close your account from the app at any time. We may suspend an account used for fraud or abuse of offers.</li>
      </ul>
    ),
  },
  {
    title: "Products, prices and availability",
    body: (
      <ul>
        <li>All prices are in Sri Lankan Rupees (LKR). The price you pay is the one shown at checkout.</li>
        <li>Prices, offers and stock can differ between branches and can change without notice. They do not change on an order you have already placed.</li>
        <li>Product photos are for illustration. Fresh and weighed items can vary slightly from the picture.</li>
        <li>We may limit the quantity of an item in one order.</li>
      </ul>
    ),
  },
  {
    title: "Placing an order",
    body: (
      <ul>
        <li>A Cash on Delivery order is confirmed when you place it.</li>
        <li>A card order is confirmed only when the payment succeeds. If it is not paid within about an hour, the order is cancelled automatically and nothing is charged.</li>
        <li>We may cancel an order, or an item in it, if the item is out of stock, the address cannot be served, or we suspect fraud. You will be told and refunded as described below.</li>
      </ul>
    ),
  },
  {
    title: "Payments",
    body: (
      <ul>
        <li>You can pay by Cash on Delivery, from your Sribees Wallet, or by Visa, Mastercard or UnionPay card.</li>
        <li>Card payments are processed on the secure payment page of our licensed payment gateway. We never see or store your full card number.</li>
        <li>The delivery charge is shown at checkout before you pay.</li>
      </ul>
    ),
  },
  {
    title: "Delivery",
    body: (
      <ul>
        <li>Orders are delivered by our courier, SribeesExpress, to the address you choose, within the areas we serve.</li>
        <li>Delivery times are estimates. Please make sure someone is available to receive the order and, where asked, give the rider the delivery code.</li>
        <li>If an order cannot be delivered, it is returned to the branch.</li>
      </ul>
    ),
  },
  {
    title: "Cancelling an order",
    body: (
      <ul>
        <li>You can cancel an order from your order page until it is delivered.</li>
        <li>If you cancel before the courier has been booked, everything you paid is refunded.</li>
        <li>If you cancel after the courier has been booked, the delivery charge is kept. It is taken from what you paid, or from your existing wallet balance, and never takes your wallet below zero.</li>
      </ul>
    ),
  },
  {
    title: "Refunds",
    body: (
      <ul>
        <li>Refunds for cancelled orders and approved returns are credited to your Sribees Wallet, including for orders paid by card.</li>
        <li>Wallet money can be used on any future SRIBEES Online order.</li>
        <li>
          For returns, see the {policyLink(ROUTES.RETURN_POLICY, "Return & Refund Policy")}: in
          short, report a problem with photos within 12 hours of delivery, and the branch
          manager decides.
        </li>
      </ul>
    ),
  },
  {
    title: "Sribees Wallet, Cash Back and referrals",
    body: (
      <ul>
        <li>Your Sribees Wallet balance can be spent only in SRIBEES Online and is not exchangeable for cash.</li>
        <li>Cash Back is added after the return window of an order closes, and is removed for any items you return.</li>
        <li>Referral rewards follow the rates shown in the app at the time. Rewards gained through fake accounts or abuse are cancelled.</li>
      </ul>
    ),
  },
  {
    title: "Fair use",
    body: (
      <p>
        You agree not to misuse the store: no false orders, false return claims, use of another
        person&apos;s identity or payment card, or attempts to interfere with the website, app or
        our systems.
      </p>
    ),
  },
  {
    title: "Our responsibility",
    body: (
      <p>
        We take care to describe products correctly and deliver them in good condition. To the
        extent Sri Lankan law allows, our responsibility for an order is limited to the amount
        you paid for it. Nothing in these terms takes away your rights as a consumer under Sri
        Lankan law.
      </p>
    ),
  },
  {
    title: "Changes to these terms",
    body: (
      <p>
        We may update these terms from time to time. The date at the top shows the latest
        version. Orders are governed by the terms in force when they were placed.
      </p>
    ),
  },
  {
    title: "Governing law",
    body: <p>These terms are governed by the laws of Sri Lanka.</p>,
  },
  {
    title: "Contact us",
    body: (
      <p>
        Questions about these terms or an order: email{" "}
        <a href="mailto:support@sribeesonline.com" className="text-[#D81B60] font-semibold hover:underline">
          support@sribeesonline.com
        </a>{" "}
        or use Help &amp; Support in the app.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="flex-1 max-w-[900px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-[#D81B60] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              Terms &amp; Conditions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              SRIBEES Online &middot; Last updated {LAST_UPDATED}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
        {SECTIONS.map((section, i) => (
          <section key={section.title}>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-[#D81B60] text-[11px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              {section.title}
            </h2>
            <div className="pl-7 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
              {section.body}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
