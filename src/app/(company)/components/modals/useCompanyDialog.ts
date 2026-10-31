"use client";

import React, { useEffect } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { CompanyModal, useCompanyUiStore } from "@/state/companyUi.store";

/** Open state, Escape, scroll lock and backdrop-close for one company page dialog. */
export function useCompanyDialog(modal: CompanyModal) {
  const isOpen = useCompanyUiStore((state) => state.activeModal === modal);
  const close = useCompanyUiStore((state) => state.closeModal);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  const onBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) close();
  };

  return { isOpen, close, onBackdropClick };
}
