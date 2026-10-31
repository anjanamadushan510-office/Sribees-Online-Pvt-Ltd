import { create } from "zustand";
import { Product } from "../interfaces/product.interface";
import { isSafeRedirectUrl } from "@/utils/urlSecurity";

interface UIStore {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (isOpen: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  activeFilterCategory: string;
  setActiveFilterCategory: (category: string) => void;

  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  isAiChatOpen: boolean;
  setIsAiChatOpen: (isOpen: boolean) => void;
  toggleAiChat: () => void;

  isLoginModalOpen: boolean;
  postLoginRedirect: string | null;
  setIsLoginModalOpen: (isOpen: boolean) => void;
  openLoginModal: (redirectPath?: string | unknown) => void;
  closeLoginModal: () => void;
  setPostLoginRedirect: (path: string | null) => void;

  // Auth & User Profile State
  isLoggedIn: boolean;
  userProfile: {
    name: string;
    email: string;
    avatarUrl: string;
    tier: string;
  } | null;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  logout: () => void;

  // User Dropdown Menu State
  isUserDropdownOpen: boolean;
  openUserDropdown: () => void;
  closeUserDropdown: () => void;
  toggleUserDropdown: () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  selectedLocation: "Colombo Central",
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  isLocationModalOpen: false,
  setIsLocationModalOpen: (isOpen) => set({ isLocationModalOpen: isOpen }),

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  activeFilterCategory: "All",
  setActiveFilterCategory: (category) =>
    set({ activeFilterCategory: category }),

  wishlistIds: ["prod-1"],
  toggleWishlist: (productId) => {
    const current = get().wishlistIds;
    if (current.includes(productId)) {
      set({ wishlistIds: current.filter((id) => id !== productId) });
    } else {
      set({ wishlistIds: [...current, productId] });
    }
  },
  isInWishlist: (productId) => get().wishlistIds.includes(productId),

  quickViewProduct: null,
  setQuickViewProduct: (product) => set({ quickViewProduct: product }),

  isAiChatOpen: false,
  setIsAiChatOpen: (isOpen) => set({ isAiChatOpen: isOpen }),
  toggleAiChat: () => set((state) => ({ isAiChatOpen: !state.isAiChatOpen })),

  isLoginModalOpen: false,
  postLoginRedirect: null,
  setIsLoginModalOpen: (isOpen) => set({ isLoginModalOpen: isOpen }),
  openLoginModal: (redirectPath) =>
    set({
      isLoginModalOpen: true,
      postLoginRedirect:
        typeof redirectPath === "string" && isSafeRedirectUrl(redirectPath)
          ? redirectPath
          : null,
    }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  setPostLoginRedirect: (path) =>
    set({
      postLoginRedirect:
        typeof path === "string" && isSafeRedirectUrl(path) ? path : null,
    }),

  // Auth & User Profile State
  isLoggedIn: false,
  userProfile: null,
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  logout: () =>
    set({ isLoggedIn: false, userProfile: null, isUserDropdownOpen: false }),

  // User Dropdown
  isUserDropdownOpen: false,
  openUserDropdown: () => set({ isUserDropdownOpen: true }),
  closeUserDropdown: () => set({ isUserDropdownOpen: false }),
  toggleUserDropdown: () =>
    set((state) => ({ isUserDropdownOpen: !state.isUserDropdownOpen })),
}));
