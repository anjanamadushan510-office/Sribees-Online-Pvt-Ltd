'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../state/cart.store';
import { useAuthStore } from '../../state/auth.store';
import { useUIStore } from '../../state/ui.store';
import { useToastStore } from '../../state/toast.store';
import {
  useGetCart,
  useUpdateCartQuantity,
  useRemoveCartItem,
  useClearCart,
} from '../../api/queries/useCart';
import { useProducts } from '@/api/queries/useProducts';
import { Product } from '@/interfaces/product.interface';
import { formatLKR } from '../../utils/formatCurrency';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { openLoginModal } = useUIStore();
  const { addToast } = useToastStore();
  
  // Local store (guest items + drawer open state)
  const {
    items: guestItems,
    isCartOpen,
    closeCart,
    updateQuantity: updateGuestQuantity,
    removeItem: removeGuestItem,
    clearCart: clearGuestCart,
    getTotalPrice: getGuestTotalPrice,
    getTotalItems: getGuestTotalItems,
  } = useCartStore();

  useBodyScrollLock(isCartOpen);

  // Server state for authenticated user
  const { data: serverCart, isLoading: isCartLoading } = useGetCart();
  const updateQuantityMutation = useUpdateCartQuantity();
  const removeCartItemMutation = useRemoveCartItem();
  const clearCartMutation = useClearCart();

  const { data: allProducts } = useProducts();
  const productsMap = React.useMemo(() => {
    const map = new Map<string, Product>();
    (allProducts || []).forEach((p) => {
      if (p.id) map.set(p.id, p);
      if (p.product_id) map.set(p.product_id, p);
    });
    return map;
  }, [allProducts]);

  if (!isCartOpen) return null;

  // Normalized display items and totals
  const isServerCart = isAuthenticated && Boolean(serverCart);
  
  const displayItems = isServerCart
    ? (serverCart?.items || []).map((item) => {
        const matchedProduct = productsMap.get(item.product_id);
        const cashbackPercentage =
          matchedProduct?.cashback_percentage != null && Number(matchedProduct.cashback_percentage) > 0
            ? Number(matchedProduct.cashback_percentage)
            : item.cashback_percentage != null && Number(item.cashback_percentage) > 0
              ? Number(item.cashback_percentage)
              : (matchedProduct?.global_cashback_percentage != null && Number(matchedProduct.global_cashback_percentage) > 0
                  ? Number(matchedProduct.global_cashback_percentage)
                  : null);

        return {
          id: item.product_id,
          title: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          unit: item.sku || '',
          originalPrice: item.original_price ?? null,
          cashbackPercentage,
        };
      })
    : guestItems.map(({ product, quantity }) => {
        const prodId = product.id || product.product_id || '';
        const matchedProduct = prodId ? productsMap.get(prodId) : product;
        const cashbackPercentage =
          matchedProduct?.cashback_percentage != null && Number(matchedProduct.cashback_percentage) > 0
            ? Number(matchedProduct.cashback_percentage)
            : product.cashback_percentage != null && Number(product.cashback_percentage) > 0
              ? Number(product.cashback_percentage)
              : (matchedProduct?.global_cashback_percentage != null && Number(matchedProduct.global_cashback_percentage) > 0
                  ? Number(matchedProduct.global_cashback_percentage)
                  : null);

        return {
          id: prodId,
          title: product.title || product.name || '',
          price: product.price || 0,
          quantity,
          image: product.image || product.images?.[0]?.image_url || '',
          unit: product.unit || product.sku || '',
          originalPrice: product.compare_at_price ?? product.originalPrice ?? null,
          cashbackPercentage,
        };
      });

  const totalItemsCount = isServerCart
    ? (serverCart?.items || []).reduce((acc, item) => acc + item.quantity, 0)
    : getGuestTotalItems();

  const subtotal = isServerCart
    ? serverCart?.totals.subtotal || 0
    : getGuestTotalPrice();

  const shipping = isServerCart
    ? serverCart?.totals.shipping || 0
    : subtotal > 3000 || subtotal === 0 ? 0 : 250;

  const total = isServerCart
    ? serverCart?.totals.total || 0
    : subtotal + shipping;

  const totalCashbackEarned = React.useMemo(() => {
    const itemsCashback = displayItems.reduce((acc, item) => {
      if (item.cashbackPercentage && item.cashbackPercentage > 0) {
        return acc + (item.price * item.quantity * item.cashbackPercentage) / 100;
      }
      return acc;
    }, 0);

    if (itemsCashback > 0) {
      return Math.round(itemsCashback * 100) / 100;
    }

    return isServerCart ? (serverCart?.totals.cashback_earned ?? 0) : 0;
  }, [displayItems, isServerCart, serverCart]);

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    if (isAuthenticated) {
      updateQuantityMutation.mutate({ productId, quantity: newQty });
    } else {
      updateGuestQuantity(productId, newQty);
    }
  };

  const handleRemoveItem = (productId: string) => {
    if (isAuthenticated) {
      removeCartItemMutation.mutate({ productId });
    } else {
      removeGuestItem(productId);
    }
  };

  const handleClearAll = () => {
    if (isAuthenticated) {
      clearCartMutation.mutate();
    } else {
      clearGuestCart();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D81B60]" />
              <h2 className="text-lg font-black text-slate-800">Your Shopping Cart</h2>
              <span className="bg-[#D81B60] text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
                {totalItemsCount}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {isCartLoading && isAuthenticated ? (
              <div className="py-12 text-center text-xs text-slate-400 font-semibold">
                Loading your cart...
              </div>
            ) : displayItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-[#D81B60]">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-base font-extrabold text-slate-800">Your cart is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Looks like you haven't added any fresh groceries or essentials yet.
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-[#D81B60] text-white font-extrabold text-xs rounded-full shadow-md shadow-rose-200"
                >
                  Start Shopping Now
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Item List</span>
                  <button
                    onClick={handleClearAll}
                    className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                {displayItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-rose-200 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-100 p-1">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'}
                        alt={item.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-extrabold text-slate-800 line-clamp-2 leading-tight">
                            {item.title}
                          </h4>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {item.unit && (
                          <span className="text-[10px] text-slate-400 font-medium">{item.unit}</span>
                        )}
                      </div>

                      {/* Cashback Badge */}
                      {item.cashbackPercentage && item.cashbackPercentage > 0 && (
                        <div className="flex items-center gap-1 mb-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-extrabold text-amber-700">
                            🎁 Earn {formatLKR((item.price * item.quantity * item.cashbackPercentage) / 100)} cashback
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-[#D81B60]">
                            {formatLKR(item.price * item.quantity)}
                          </span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-[10px] font-medium text-slate-400 line-through">
                              {formatLKR(item.originalPrice * item.quantity)}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-2 py-0.5 shadow-2xs">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="text-slate-500 hover:text-[#D81B60] p-0.5 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-extrabold text-slate-800 w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="text-slate-500 hover:text-[#D81B60] p-0.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer Summary */}
          {displayItems.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">{formatLKR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SriBees Express Delivery</span>
                  <span className="font-bold text-emerald-600">
                    {shipping === 0 ? 'FREE' : formatLKR(shipping)}
                  </span>
                </div>
                {isServerCart && serverCart?.delivery?.message && (
                  <p className="text-[10px] text-amber-600 font-semibold italic">
                    {serverCart.delivery.message}
                  </p>
                )}
                {!isServerCart && subtotal < 3000 && (
                  <p className="text-[10px] text-slate-400 italic">
                    Add {formatLKR(3000 - subtotal)} more for FREE delivery!
                  </p>
                )}
                {totalCashbackEarned > 0 && (
                  <div className="flex justify-between items-center py-1.5 px-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="flex items-center gap-1 text-amber-700 font-extrabold">
                      🎁 Total Cashback Earned
                    </span>
                    <span className="font-black text-amber-700">
                      +{formatLKR(totalCashbackEarned)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-base text-[#D81B60]">{formatLKR(total)}</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  closeCart();
                  if (!isAuthenticated) {
                    addToast({
                      title: 'Sign In Required',
                      message: 'Please sign in or register to proceed to checkout.',
                      type: 'warning',
                    });
                    openLoginModal('/checkoutView');
                    return;
                  }
                  router.push('/checkoutView');
                }}
                className="w-full py-3.5 bg-[#D81B60] hover:bg-[#C2185B] text-white font-black text-xs uppercase tracking-wider rounded-full shadow-lg shadow-rose-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
