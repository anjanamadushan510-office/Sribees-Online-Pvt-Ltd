"use client";

import React from "react";
import { OrderHistoryView } from "./components/OrderHistoryView";

export default function OrderHistoryPage() {
  return (
    <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <OrderHistoryView />
    </main>
  );
}
