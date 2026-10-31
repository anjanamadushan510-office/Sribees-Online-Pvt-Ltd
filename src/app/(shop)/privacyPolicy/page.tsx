import React from "react";
import type { Metadata } from "next";
import { PrivacyHeader } from "./components/PrivacyHeader";
import { PrivacyCards } from "./components/PrivacyCards";
import { PrivacyContactCard } from "./components/PrivacyContactCard";

export const metadata: Metadata = {
  title: "Privacy & Data Security | SRIBEES Online",
  description:
    "Learn how SRIBEES Online protects your personal information and secures all online and Cash on Delivery grocery payments.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6">
      {/* Header Banner */}
      <PrivacyHeader />

      {/* Main Security & Privacy Cards */}
      <PrivacyCards />

      {/* Contact & Account Support Card */}
      <PrivacyContactCard />
    </main>
  );
}
