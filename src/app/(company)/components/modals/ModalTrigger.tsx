"use client";

import React from "react";
import { CompanyModal, useCompanyUiStore } from "@/state/companyUi.store";

interface ModalTriggerProps {
  modal: CompanyModal;
  className?: string;
  children: React.ReactNode;
}

export function ModalTrigger({ modal, className = "", children }: ModalTriggerProps) {
  const openModal = useCompanyUiStore((state) => state.openModal);

  return (
    <button type="button" onClick={() => openModal(modal)} className={`cursor-pointer ${className}`}>
      {children}
    </button>
  );
}
