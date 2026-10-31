"use client";

import { ROUTES } from "@/constants/routes";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { CheckoutHeader } from "./components/CheckoutHeader";
import { CartItemsList } from "./components/CartItemsList";
import { OrderSummarySidebar } from "./components/OrderSummarySidebar";
import { CheckoutCartItem } from "./components/CartItemCard";
import {
  AddressChangeModal,
  AddressOption,
} from "./components/AddressChangeModal";
import { OrderSuccessModal } from "./components/OrderSuccessModal";
import { useCartStore } from "@/state/cart.store";
import { useAuthStore } from "@/state/auth.store";
import { useUIStore } from "@/state/ui.store";
import {
  useGetCart,
  useUpdateCartQuantity,
  useRemoveCartItem,
  useClearCart,
} from "@/api/queries/useCart";
import { useProducts } from "@/api/queries/useProducts";
import { Product } from "@/interfaces/product.interface";
import { useGetAddresses } from "@/api/queries/useAddresses";
import { useGetPaymentMethods } from "@/api/queries/usePaymentMethods";
import { useQuoteOrder, useCreateOrder } from "@/api/queries/useOrders";
import { useGetWalletBalance } from "@/api/queries/useWallet";
import { useToastStore } from "@/state/toast.store";
import { isDummyPhone } from "@/utils/formatMobileNumber";

export default function CheckoutViewPage() {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const { openLoginModal, userProfile } = useUIStore();
  const addToast = useToastStore((state) => state.addToast);

  // Redirect unauthenticated users back to home and trigger login modal
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      addToast({
        title: "Sign In Required",
        message: "Please sign in or register to complete your order checkout.",
        type: "warning",
      });
      openLoginModal("/checkoutView");
      router.push(ROUTES.HOME);
    }
  }, [isInitialized, isAuthenticated, openLoginModal, router, addToast]);

  // Local cart store fallback for guest
  const {
    items: guestItems,
    clearCart: clearGuestCart,
    updateQuantity: updateGuestQuantity,
    removeItem: removeGuestItem,
  } = useCartStore();

  // Server Queries & Mutations
  const { data: serverCart } = useGetCart();
  const updateQuantityMutation = useUpdateCartQuantity();
  const removeCartItemMutation = useRemoveCartItem();
  const clearCartMutation = useClearCart();

  const { data: addressesData = [] } = useGetAddresses();
  const { data: paymentMethods = [] } = useGetPaymentMethods();
  const { data: walletData } = useGetWalletBalance();

  const quoteOrderMutation = useQuoteOrder();
  const quoteData = quoteOrderMutation.data ?? null;
  const createOrderMutation = useCreateOrder();

  const customerDisplayName =
    user?.fullName ||
    (userProfile?.name && userProfile.name !== "Valued Customer"
      ? userProfile.name
      : "") ||
    "";

  // Address State
  const [selectedAddress, setSelectedAddress] = useState<AddressOption>({
    id: "",
    name: customerDisplayName || "Customer",
    address: "Select a delivery address",
    contact: user?.phone || "0771234567",
    tag: "Home",
  });
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Sync default address from API
  useEffect(() => {
    const currentCustomerName =
      user?.fullName ||
      (userProfile?.name && userProfile.name !== "Valued Customer"
        ? userProfile.name
        : "") ||
      "";

    if (addressesData.length > 0) {
      const defaultAddr =
        addressesData.find((a) => a.is_default) || addressesData[0];
      const hasCustomRecipient =
        defaultAddr.recipient_name &&
        defaultAddr.recipient_name !== "Valued Customer" &&
        defaultAddr.recipient_name !== "Customer";

      const addrPhone = defaultAddr.phone?.trim();
      const resolvedPhone =
        !isDummyPhone(addrPhone) && addrPhone
          ? addrPhone
          : user?.phone || "0771234567";

      setSelectedAddress({
        id: defaultAddr.address_id,
        name: hasCustomRecipient
          ? defaultAddr.recipient_name
          : currentCustomerName || defaultAddr.title || "Customer",
        address: `${defaultAddr.address_line1}${defaultAddr.address_line2 ? `, ${defaultAddr.address_line2}` : ""}, ${defaultAddr.postal_city}, ${defaultAddr.district}`,
        contact: resolvedPhone,
        tag: defaultAddr.title || "Home",
      });
    } else if (currentCustomerName || user?.phone) {
      setSelectedAddress((prev) => ({
        ...prev,
        name:
          !prev.name || prev.name === "Customer" || prev.name === "Valued Customer"
            ? currentCustomerName
            : prev.name,
        contact:
          isDummyPhone(prev.contact) && user?.phone ? user.phone : prev.contact,
      }));
    }
  }, [addressesData, user, userProfile]);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // Wallet State
  const walletBalance = walletData?.balance ?? 2500;
  const [walletAppliedAmount, setWalletAppliedAmount] = useState(0);

  // Payment Selection State ('wallet' | 'card' | 'cod')
  const [selectedPayment, setSelectedPayment] = useState<
    "wallet" | "card" | "cod"
  >("cod");

  // Secondary payment for split-pay (Wallet + Card or Wallet + COD)
  // Only relevant when selectedPayment === 'wallet' and walletAppliedAmount < totalBeforeWallet
  const [secondaryPayment, setSecondaryPayment] = useState<"card" | "cod" | null>(null);

  // Success Modal State
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<{
    orderNumber: string;
    totalAmount: number;
    paymentActionUrl?: string;
  }>({ orderNumber: "", totalAmount: 0 });

  const { data: allProducts } = useProducts();

  const productsMap = useMemo(() => {
    const map = new Map<string, Product>();
    (allProducts || []).forEach((p) => {
      if (p.id) map.set(p.id, p);
      if (p.product_id) map.set(p.product_id, p);
    });
    return map;
  }, [allProducts]);

  // Map server/guest items into CheckoutCartItem[] format
  const isServerCart = isAuthenticated && Boolean(serverCart);

  const items: CheckoutCartItem[] = useMemo(() => {
    if (isServerCart && serverCart) {
      return serverCart.items.map((item) => {
        const matchedProduct = productsMap.get(item.product_id);
        const rawOriginal =
          Number((item as any).original_price) ||
          Number((item as any).compare_at_price) ||
          Number((item as any).global_price) ||
          Number((item as any).regular_price) ||
          Number((item as any).originalPrice) ||
          (matchedProduct
            ? Number(
                (matchedProduct.global_price && matchedProduct.global_price > item.price
                  ? matchedProduct.global_price
                  : undefined) ||
                matchedProduct.originalPrice ||
                (matchedProduct.compare_at_price && matchedProduct.compare_at_price > item.price
                  ? matchedProduct.compare_at_price
                  : undefined)
              )
            : undefined);

        let originalPrice =
          rawOriginal && rawOriginal > item.price ? rawOriginal : undefined;

        if (
          !originalPrice &&
          (item as any).discount_amount &&
          Number((item as any).discount_amount) > 0
        ) {
          originalPrice = item.price + Number((item as any).discount_amount);
        }

        // Prioritize Admin Panel configured cashback percentage on product,
        // then cart item's cashback percentage, then global cashback percentage.
        const effectiveCashbackPercentage =
          matchedProduct?.cashback_percentage != null && Number(matchedProduct.cashback_percentage) > 0
            ? Number(matchedProduct.cashback_percentage)
            : item.cashback_percentage != null && Number(item.cashback_percentage) > 0
              ? Number(item.cashback_percentage)
              : (matchedProduct?.global_cashback_percentage != null && Number(matchedProduct.global_cashback_percentage) > 0
                  ? Number(matchedProduct.global_cashback_percentage)
                  : undefined);

        const itemCashbackEarned = effectiveCashbackPercentage
          ? Math.round(((item.price * item.quantity * effectiveCashbackPercentage) / 100) * 100) / 100
          : undefined;

        return {
          id: item.product_id,
          title: item.name,
          subtitle: `Qty: ${item.quantity}`,
          unitPrice: item.price,
          originalPrice,
          quantity: item.quantity,
          image:
            item.image ||
            "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
          imageBadge: effectiveCashbackPercentage
            ? `${effectiveCashbackPercentage}% Cashback`
            : undefined,
          imageBadgeColor: "emerald",
          bottomTag: item.sku ? `SKU: ${item.sku}` : "Fresh Guaranteed",
          cashbackPercentage: effectiveCashbackPercentage,
          cashbackEarned: itemCashbackEarned,
        };
      });
    }

    return guestItems.map(({ product, quantity }) => {
      const prodId = product.id || product.product_id || "";
      const matchedProduct = prodId ? productsMap.get(prodId) : product;

      const rawOriginal =
        (product.global_price && product.global_price > product.price
          ? product.global_price
          : undefined) ||
        product.originalPrice ||
        (product.compare_at_price && product.compare_at_price > product.price
          ? product.compare_at_price
          : undefined) ||
        (matchedProduct?.global_price && matchedProduct.global_price > (product.price || 0)
          ? matchedProduct.global_price
          : undefined) ||
        matchedProduct?.originalPrice ||
        (matchedProduct?.compare_at_price && matchedProduct.compare_at_price > (product.price || 0)
          ? matchedProduct.compare_at_price
          : undefined);

      const originalPrice =
        rawOriginal && rawOriginal > (product.price || 0) ? rawOriginal : undefined;

      const effectiveCashbackPercentage =
        matchedProduct?.cashback_percentage != null && Number(matchedProduct.cashback_percentage) > 0
          ? Number(matchedProduct.cashback_percentage)
          : product.cashback_percentage != null && Number(product.cashback_percentage) > 0
            ? Number(product.cashback_percentage)
            : (matchedProduct?.global_cashback_percentage != null && Number(matchedProduct.global_cashback_percentage) > 0
                ? Number(matchedProduct.global_cashback_percentage)
                : undefined);

      const itemCashbackEarned = effectiveCashbackPercentage
        ? Math.round((((product.price || 0) * quantity * effectiveCashbackPercentage) / 100) * 100) / 100
        : undefined;

      return {
        id: prodId,
        title: product.title || product.name || "",
        subtitle: `Qty: ${quantity}`,
        unitPrice: product.price || 0,
        originalPrice,
        quantity,
        image:
          product.image ||
          product.images?.[0]?.image_url ||
          "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
        imageBadge: effectiveCashbackPercentage
          ? `${effectiveCashbackPercentage}% Cashback`
          : undefined,
        imageBadgeColor: "emerald",
        bottomTag: product.unit || "Fresh Guaranteed",
        cashbackPercentage: effectiveCashbackPercentage,
        cashbackEarned: itemCashbackEarned,
      };
    });
  }, [isServerCart, serverCart, guestItems, productsMap]);

  // Quantity updates
  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    if (isAuthenticated) {
      updateQuantityMutation.mutate({ productId: id, quantity: newQty });
    } else {
      updateGuestQuantity(id, newQty);
    }
  };

  const handleRemoveItem = (id: string) => {
    if (isAuthenticated) {
      removeCartItemMutation.mutate({ productId: id });
    } else {
      removeGuestItem(id);
    }
  };

  const handleClearAll = () => {
    if (isAuthenticated) {
      clearCartMutation.mutate();
    } else {
      clearGuestCart();
    }
  };

  const handleToggleSaveForLater = (_id: string) => {
    // UI toggle stub
  };

  // Cost Calculations
  const subtotal = useMemo(() => {
    if (isServerCart && serverCart) return serverCart.totals.subtotal;
    return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [isServerCart, serverCart, items]);

  const totalItemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const deliveryFee =
    isServerCart && serverCart
      ? serverCart.totals.shipping
      : subtotal > 0
        ? 350
        : 0;

  // Coupon discount — prefer the backend-authoritative value from the quote API.
  // The quote response contains the real discount computed by the backend using
  // the coupon's discount_type, discount_value, min_order_value and
  // max_discount_amount settings from the Admin Panel.
  // Only fall back to a frontend estimate when the quote hasn't been fetched yet
  // (e.g. delivery address not yet selected).
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;

    // Use backend quote discount when available
    if (quoteData?.coupon?.applied && typeof quoteData.coupon.discount === "number") {
      return quoteData.coupon.discount;
    }

    // Also accept the top-level discount field from the quote (covers cases where
    // coupon sub-object is absent but discount is already computed).
    if (quoteData && typeof quoteData.discount === "number" && quoteData.discount > 0) {
      return quoteData.discount;
    }

    // Fallback: compute client-side using cart coupon details (if available).
    // This mirrors the backend rules (percentage → cap at max_discount_amount).
    const cartCoupon = serverCart?.coupon;
    if (cartCoupon) {
      const type = cartCoupon.discount_type?.toLowerCase();
      const value = cartCoupon.discount_value ?? 0;
      if (type === "percentage") {
        const raw = subtotal * (value / 100);
        const max = cartCoupon.max_discount_amount;
        return max && max > 0 ? Math.min(raw, max) : raw;
      }
      if (type === "fixed") {
        return Math.min(value, subtotal);
      }
    }

    // Last resort: show 0 rather than an incorrect hard-coded percentage.
    return 0;
  }, [appliedCoupon, quoteData, serverCart, subtotal]);

  const cashbackEarned = useMemo(() => {
    // Calculate total cashback earned based on each item's configured Admin Panel cashback percentage
    const itemsCashback = items.reduce((acc, item) => {
      const cb = item.cashbackPercentage;
      if (cb && cb > 0) {
        return acc + (item.unitPrice * item.quantity * cb) / 100;
      }
      return acc;
    }, 0);

    if (itemsCashback > 0) {
      return Math.round(itemsCashback * 100) / 100;
    }

    if (quoteData && typeof quoteData.cashback_earned === "number" && quoteData.cashback_earned > 0) {
      return quoteData.cashback_earned;
    }

    if (isServerCart && serverCart) {
      return serverCart.totals.cashback_earned ?? 0;
    }

    return 0;
  }, [items, quoteData, isServerCart, serverCart]);

  const totalBeforeWallet = Math.max(
    0,
    subtotal + deliveryFee - couponDiscount,
  );

  // Remaining amount to pay via secondary method when wallet is partially used
  const remainingAfterWallet = Math.max(0, Math.round((totalBeforeWallet - walletAppliedAmount) * 100) / 100);

  // Whether the order requires a secondary payment method
  const needsSecondaryPayment = selectedPayment === "wallet" && remainingAfterWallet > 0;

  // Quote server sync — debounced to avoid excessive API calls when multiple
  // dependencies change rapidly (address sync, cart update, etc.)
  const quoteDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !selectedAddress.id || items.length === 0) return;

    if (quoteDebounceRef.current) clearTimeout(quoteDebounceRef.current);

    quoteDebounceRef.current = setTimeout(() => {
      // For split payment: use the secondary payment code; for wallet-only use WALLET;
      // for card/cod use their codes directly.
      let paymentCode: string;
      if (selectedPayment === "wallet") {
        const remaining = Math.max(0, totalBeforeWallet - walletAppliedAmount);
        if (remaining > 0 && secondaryPayment) {
          paymentCode = secondaryPayment === "card" ? "MARX_OTHER" : "COD";
        } else {
          paymentCode = "WALLET";
        }
      } else {
        paymentCode = selectedPayment === "card" ? "MARX_OTHER" : "COD";
      }

      quoteOrderMutation.mutate({
        delivery_address_id: selectedAddress.id,
        payment_method: paymentCode,
        use_wallet: selectedPayment === "wallet" || walletAppliedAmount > 0,
        wallet_amount:
          walletAppliedAmount > 0 ? walletAppliedAmount : undefined,
        coupon_code: appliedCoupon || undefined,
      });
    }, 800);

    return () => {
      if (quoteDebounceRef.current) clearTimeout(quoteDebounceRef.current);
    };
  }, [
    isAuthenticated,
    selectedAddress.id,
    selectedPayment,
    secondaryPayment,
    walletAppliedAmount,
    appliedCoupon,
    items.length,
    // NOTE: totalBeforeWallet intentionally excluded — it's a derived display value.
    // Including it causes an infinite loop: quote response → couponDiscount updates →
    // totalBeforeWallet changes → triggers new quote → repeat.
  ]);

  // Payment Selection Handler
  const handleSelectPayment = (method: "wallet" | "card" | "cod") => {
    setSelectedPayment(method);
    if (method === "wallet") {
      // Auto-apply maximum available wallet balance (up to order total)
      const maxUse = Math.min(walletBalance, totalBeforeWallet);
      setWalletAppliedAmount(Math.round(maxUse * 100) / 100);
      // Reset secondary payment when switching to wallet
      setSecondaryPayment(null);
    } else {
      setWalletAppliedAmount(0);
      setSecondaryPayment(null);
    }
  };

  // Secondary payment handler (for split-pay mode)
  const handleSelectSecondaryPayment = (method: "card" | "cod") => {
    setSecondaryPayment(method);
  };

  // Coupon handlers
  const handleApplyCoupon = (code: string) => {
    setCouponCode(code);
    setAppliedCoupon(code);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  // Wallet handlers
  const handleApplyWalletMax = () => {
    const maxUse = Math.min(walletBalance, totalBeforeWallet);
    setWalletAppliedAmount(Math.round(maxUse * 100) / 100);
  };

  const handleUpdateWalletAmount = (val: number) => {
    const sanitized = Math.max(
      0,
      Math.min(val, walletBalance, totalBeforeWallet),
    );
    setWalletAppliedAmount(Math.round(sanitized * 100) / 100);
  };

  // Place Order handler
  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      addToast({
        title: "Sign In Required",
        message: "Please sign in or register to complete your order checkout.",
        type: "error",
      });
      openLoginModal("/checkoutView");
      return;
    }

    if (!selectedAddress.id) {
      addToast({
        title: "Delivery Address Missing",
        message: "Please select or add a delivery address to proceed.",
        type: "error",
      });
      setIsAddressModalOpen(true);
      return;
    }

    // Validate split payment: secondary method required when wallet doesn't cover full total
    if (needsSecondaryPayment && !secondaryPayment) {
      addToast({
        title: "Secondary Payment Required",
        message: `Your wallet covers Rs. ${walletAppliedAmount.toFixed(2)}. Please select Card or COD to pay the remaining Rs. ${remainingAfterWallet.toFixed(2)}.`,
        type: "warning",
      });
      return;
    }

    const resolvedContact =
      !isDummyPhone(selectedAddress.contact) && selectedAddress.contact
        ? selectedAddress.contact
        : user?.phone || "0771234567";

    // WEB_STOREFRONT_API requires contact_phone and alternate_phone to differ
    const altPhone =
      user?.alternatePhone &&
      !isDummyPhone(user.alternatePhone) &&
      user.alternatePhone !== resolvedContact
        ? user.alternatePhone
        : resolvedContact.startsWith("077") || resolvedContact.startsWith("+9477")
          ? "0719876543"
          : "0771234567";

    // For split payment: when wallet is partial, use secondary payment method code;
    // when wallet covers 100%, use WALLET; otherwise use selected method directly.
    let paymentMethodCode: string;
    if (selectedPayment === "wallet") {
      const remaining = Math.max(0, totalBeforeWallet - walletAppliedAmount);
      if (remaining > 0 && secondaryPayment) {
        paymentMethodCode = secondaryPayment === "card" ? "MARX_OTHER" : "COD";
      } else {
        paymentMethodCode = "WALLET";
      }
    } else {
      paymentMethodCode = selectedPayment === "card" ? "MARX_OTHER" : "COD";
    }

    createOrderMutation.mutate(
      {
        delivery_address_id: selectedAddress.id,
        contact_phone: resolvedContact,
        alternate_phone: altPhone,
        payment_method: paymentMethodCode,
        use_wallet: selectedPayment === "wallet" || walletAppliedAmount > 0,
        wallet_amount:
          walletAppliedAmount > 0 ? walletAppliedAmount : undefined,
        coupon_code: appliedCoupon || undefined,
      },
      {
        onSuccess: (response) => {
          const createdOrder = response;
          const orderNum =
            createdOrder.order_number ||
            `SRB-${Math.floor(10000 + Math.random() * 90000)}`;
          const finalAmount =
            createdOrder.total_amount ||
            Math.max(0, totalBeforeWallet - walletAppliedAmount);

          setLastOrderDetails({
            orderNumber: orderNum,
            totalAmount: finalAmount,
            paymentActionUrl: createdOrder.payment_action?.url,
          });

          setIsSuccessModalOpen(true);
          clearCartMutation.mutate();
          clearGuestCart();
        },
      },
    );
  };

  return (
    <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Top Header */}
      <CheckoutHeader itemCount={totalItemCount} />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Items List & Green Grocery Banner (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <CartItemsList
            items={items}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearAll={handleClearAll}
            onToggleSaveForLater={handleToggleSaveForLater}
          />
        </div>

        {/* Right Column: Order Summary Sidebar (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
          <OrderSummarySidebar
            subtotal={subtotal}
            itemCount={totalItemCount}
            deliveryFee={deliveryFee}
            couponDiscount={couponDiscount}
            couponCode={couponCode}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            cashbackEarned={cashbackEarned}
            walletBalance={walletBalance}
            walletAppliedAmount={walletAppliedAmount}
            onApplyWalletMax={handleApplyWalletMax}
            onUpdateWalletAmount={handleUpdateWalletAmount}
            selectedAddress={selectedAddress}
            onChangeAddressClick={() => setIsAddressModalOpen(true)}
            selectedPayment={selectedPayment}
            onSelectPayment={handleSelectPayment}
            secondaryPayment={secondaryPayment}
            onSelectSecondaryPayment={handleSelectSecondaryPayment}
            needsSecondaryPayment={needsSecondaryPayment}
            remainingAfterWallet={remainingAfterWallet}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      </div>

      {/* Address Selection Modal */}
      <AddressChangeModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        selectedAddressId={selectedAddress.id}
        onSelectAddress={(addr) => setSelectedAddress(addr)}
      />

      {/* Order Success Confirmation Modal */}
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          router.push("/orderHistory");
        }}
        orderNumber={lastOrderDetails.orderNumber}
        totalAmount={lastOrderDetails.totalAmount}
        paymentMethod={
          selectedPayment === "wallet" && needsSecondaryPayment && secondaryPayment
            ? `Wallet + ${secondaryPayment === "card" ? "Credit / Debit Card" : "Cash on Delivery (COD)"}`
            : selectedPayment === "wallet"
              ? "SRIBEES Cash Wallet"
              : selectedPayment === "card"
                ? "Credit / Debit Card"
                : "Cash on Delivery (COD)"
        }
        customerName={selectedAddress.name}
        customerPhone={selectedAddress.contact}
        deliveryAddress={selectedAddress.address}
        items={items.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          quantity: item.quantity,
          image: item.image,
        }))}
      />
    </main>
  );
}
