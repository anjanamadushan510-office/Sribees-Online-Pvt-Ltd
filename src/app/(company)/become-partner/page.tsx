import type { Metadata } from "next";
import { PartnerHero } from "../components/partner/PartnerHero";
import { PartnerHowItWorks } from "../components/partner/PartnerHowItWorks";
import { PartnerCTA } from "../components/partner/PartnerCTA";
import { PartnerFAQ } from "../components/partner/PartnerFAQ";
import { EarningsCalculatorModal } from "../components/partner/EarningsCalculatorModal";

export const metadata: Metadata = {
  title: "Become a SRIBEES Partner | SRIBEES Online",
  description:
    "Join the SRIBEES Online Partner Engine. Share your unique link and earn commission on grocery orders delivered in Sri Lanka.",
};

export default function BecomePartnerPage() {
  return (
    <>
      <PartnerHero />
      <PartnerHowItWorks />
      <PartnerCTA />
      <PartnerFAQ />
      <EarningsCalculatorModal />
    </>
  );
}
