export const ORDER_ENDPOINTS = {
  ORDERS: "/orders",
  ORDER_BY_ID: (id: string) => `/orders/${encodeURIComponent(id)}`,
  QUOTE: "/orders/quote",
  CANCEL_ORDER: (id: string) => `/orders/${encodeURIComponent(id)}/cancel`,
  TRACKING: (id: string) => `/orders/${encodeURIComponent(id)}/tracking`,
  REORDER: (id: string) => `/orders/${encodeURIComponent(id)}/reorder`,
  RETURN: (id: string) => `/orders/${encodeURIComponent(id)}/return`,
  RETURN_IMAGES: (id: string) =>
    `/orders/${encodeURIComponent(id)}/return/images`,
  INVOICE: (id: string) => `/orders/${encodeURIComponent(id)}/invoice`,
} as const;

