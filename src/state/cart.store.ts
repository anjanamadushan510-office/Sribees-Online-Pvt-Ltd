import { create } from "zustand";
import { Product } from "../interfaces/product.interface";
import { CartItem, ApiCartItem } from "../interfaces/cart.interface";
import { useToastStore } from "./toast.store";

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isCartOpen: false,

  addItem: (product, quantity = 1) => {
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex(
      (i) => i.product.id === product.id || i.product.product_id === product.id,
    );

    if (existingIndex > -1) {
      const updated = [...currentItems];
      updated[existingIndex].quantity += quantity;
      set({ items: updated });
    } else {
      set({ items: [...currentItems, { product, quantity }] });
    }

    useToastStore.getState().addToast({
      title: "Added to Cart",
      message: `${product.title || product.name} added to your cart`,
      image: product.image || product.images?.[0]?.image_url,
      actionLabel: "View Cart",
    });
  },

  removeItem: (productId) => {
    set({
      items: get().items.filter(
        (i) => i.product.id !== productId && i.product.product_id !== productId,
      ),
    });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.product.id === productId || item.product.product_id === productId
          ? { ...item, quantity }
          : item,
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  setItems: (items) => set({ items }),

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce(
      (total, item) => total + (item.product.price || 0) * item.quantity,
      0,
    );
  },
}));
