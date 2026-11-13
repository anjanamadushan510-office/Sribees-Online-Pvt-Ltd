"use client";

import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AiChatWidget } from "@/components/common/AiChatWidget";
import { ToastContainer } from "@/components/Toast";
import { LocationModal } from "@/components/LocationModal";
import { UserLocationInitializer } from "@/components/UserLocationInitializer";
import { WebPresence } from "@/components/WebPresence";
import { useAuthStore } from "@/state/auth.store";
import { useSessionStore } from "@/state/session.store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    useAuthStore.getState().initAuth();
    useSessionStore.getState().initSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastContainer />
      <LocationModal />
      <UserLocationInitializer />
      <WebPresence />
      <AiChatWidget />
    </QueryClientProvider>
  );
}
