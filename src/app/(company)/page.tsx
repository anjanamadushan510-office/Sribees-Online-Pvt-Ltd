import type { Metadata } from "next";
import { Hero } from "./components/sections/Hero";
import { AppBanner } from "./components/sections/AppBanner";
import { HowItWorks } from "./components/sections/HowItWorks";
import { AboutSection } from "./components/sections/AboutSection";
import { ImpactSection } from "./components/sections/ImpactSection";
import { AppDownloadCTA } from "./components/sections/AppDownloadCTA";

export const metadata: Metadata = {
  title: "SRIBEES Online | Virtual Grocery Network Sri Lanka",
  description:
    "Sri Lanka's virtual supermarket. Shop your everyday groceries on the web or in the SRIBEES Online app and get them delivered to your doorstep.",
};

export default function CompanyHomePage() {
  return (
    <>
      <Hero />
      <AppBanner />
      <HowItWorks />
      <AboutSection />
      <ImpactSection />
      <AppDownloadCTA />
    </>
  );
}
