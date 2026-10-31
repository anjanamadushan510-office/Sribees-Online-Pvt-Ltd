import { create } from "zustand";

export type CompanyModal = "download" | "terms" | "calculator";

interface CompanyUiState {
  activeModal: CompanyModal | null;
  openModal: (modal: CompanyModal) => void;
  closeModal: () => void;
}

export const useCompanyUiStore = create<CompanyUiState>((set) => ({
  activeModal: null,
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
}));
