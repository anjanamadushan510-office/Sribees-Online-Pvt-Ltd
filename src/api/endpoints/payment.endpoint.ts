export const PAYMENT_ENDPOINTS = {
  METHODS: "/payment-methods",
  COMPLETE_PAYMENT: (orderId: string) => `/payments/orders/${orderId}/complete`,
  PAY_ORDER: (orderId: string) => `/payments/orders/${orderId}/pay`,
} as const;
