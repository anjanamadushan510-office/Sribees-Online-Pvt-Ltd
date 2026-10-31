'use client';

import React from 'react';
import { HeroBanner } from './HeroBanner';
import { CategorySection } from './CategorySection';
import { ProductGrid } from '@/components/product/ProductGrid';
import { AdvantageSection } from './AdvantageSection';
import { MobileAppBanner } from './MobileAppBanner';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-1 sm:space-y-4">
      {/* 1. Hero Promotional Banner & Feature Badges Bar */}
      <HeroBanner />

      {/* 2. Shop by Category Grid */}
      <CategorySection />

      {/* 3. Quick Sale Product Grid */}
      <ProductGrid />

      {/* 4. Why Shop With SRIBEES? 4-Column Feature Grid */}
      <AdvantageSection />

      {/* 5. Mobile App Download & AI Assistant Banner */}
      <MobileAppBanner />
    </div>
  );
};
