import type { Metadata } from "next";
import { FoundationalValuesSection } from "../components/sections/FoundationalValuesSection";
import { GroceryRevolutionCTASection } from "../components/sections/GroceryRevolutionCTASection";

export const metadata: Metadata = {
  title: "About Us | SRIBEES Online",
  description:
    "Learn about SRIBEES Online, Sri Lanka's virtual grocery network bringing local products, virtual stores and doorstep delivery together.",
};

export default function AboutPage() {
  return (
    <>
      <FoundationalValuesSection />
      <GroceryRevolutionCTASection />
    </>
  );
}
