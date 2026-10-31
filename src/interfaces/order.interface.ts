import { PaymentAction } from './payment.interface';

export interface ApiOrderPaymentInfo {
  method?: {
    code: string;
    name: string;
    icon: string;
  };
  state?: string;
  title?: string;
  message?: string | null;
  tone?: "success" | "info" | "warning" | "error" | string;
  can_pay?: boolean;
  pay_label?: string | null;
  pay_by?: string | null;
}

export interface ApiOrderStatusTimelineItem {
  status: string;
  label: string;
  timestamp?: string | null;
  completed: boolean;
  current: boolean;
}

export interface ApiOrderItem {
  order_item_id?: string;
  product_id: string;
  variant_id?: string | null;
  product_name: string;
  product_sku?: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  tax_amount?: number;
  is_reviewed?: boolean;
  is_returnable?: boolean;
  cashback_percentage?: number;
  cashback_earned?: number;
}

export interface ApiOrderAddress {
  address_id?: string;
  recipient_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string | null;
  postal_city?: string;
  district?: string;
  province?: string;
  postal_code?: string;
}

export interface ApiOrder {
  order_id: string;
  order_number: string;
  status: string;
  status_label?: string;
  payment?: ApiOrderPaymentInfo;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  tax_amount?: number;
  shipping_amount?: number;
  delivery_fee?: number;
  discount_amount?: number;
  wallet_deduction?: number;
  cashback_earned?: number;
  total_amount: number;
  coupon_code?: string | null;
  notes?: string | null;
  show_delivery_code?: boolean;
  delivery_verification_code?: string | null;
  delivery_verification_status?: string | null;
  courier_tracking_status?: string | null;
  courier_waybill_number?: string | null;
  can_cancel?: boolean;
  cancel_state?: "free" | "fee" | "blocked" | string;
  cancel_refund_amount?: number;
  cancel_courier_fee?: number;
  cancel_wallet_charge?: number;
  return_window_expires_at?: string | null;
  refund_amount?: number | null;
  status_timeline?: ApiOrderStatusTimelineItem[];
  delivery_address?: ApiOrderAddress;
  items?: ApiOrderItem[];
  item_count: number;
  created_at: string;
  updated_at?: string;
  shipped_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
}

export interface GetOrdersResponse {
  success: boolean;
  data: {
    orders: ApiOrder[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
    total?: number;
    page?: number;
    total_pages?: number;
  };
}

export interface GetOrderDetailsResponse {
  success: boolean;
  data: ApiOrder;
}

export interface OrderQuotePayload {
  delivery_address_id: string;
  payment_method?: string;
  use_wallet?: boolean;
  wallet_amount?: number;
  coupon_code?: string;
  items?: Array<{
    product_id: string;
    variant_id?: string | null;
    quantity: number;
    price?: number;
    name?: string;
  }>;
  is_buy_now?: boolean;
}

export interface OrderQuoteData {
  subtotal: number;
  delivery_fee: number;
  discount: number;
  tax: number;
  wallet_deduction: number;
  cashback_earned: number;
  total: number;
  currency: string;
  delivery_status: string;
  delivery_available: boolean;
  delivery_message?: string | null;
  delivery?: {
    status: string;
    available: boolean;
    fee: number;
    message?: string | null;
    address_id?: string | null;
    postal_city?: string | null;
  };
  cashback_rate?: number;
  wallet_balance?: number;
  wallet_applied?: boolean;
  item_count?: number;
  coupon?: {
    code: string;
    label?: string;
    applied: boolean;
    discount?: number;
    reason?: string | null;
  } | null;
}

export interface OrderQuoteResponse {
  success: boolean;
  data: OrderQuoteData;
}

export interface CreateOrderPayload {
  delivery_address_id: string;
  contact_phone: string;
  alternate_phone: string;
  payment_method?: string;
  use_wallet?: boolean;
  wallet_amount?: number;
  coupon_code?: string;
  notes?: string;
  is_buy_now?: boolean;
  items?: Array<{
    product_id: string;
    variant_id?: string | null;
    quantity: number;
    price?: number;
    name?: string;
  }>;
  delivery_slot_date?: string;
  delivery_slot_time?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message?: string;
  data: ApiOrder & {
    payment_action?: PaymentAction | null;
  };
}

export type OrderTabCategory =
  | "all"
  | "current"
  | "previous"
  | "cancelled"
  | "returns";

export interface OrderTrackingHistoryItem {
  status?: string;
  description?: string;
  location?: string;
  timestamp?: string;
}

export interface OrderTrackingData {
  courier_tracking_status?: string | null;
  courier_waybill_number?: string | null;
  courier_tracking_url?: string | null;
  cod_collected?: boolean;
  handover_verified?: boolean;
  failure_note?: string | null;
  history?: OrderTrackingHistoryItem[];
}

export interface ReturnImageResponse {
  success: boolean;
  data: {
    path: string;
    url: string;
  };
}

export interface ReturnOrderPayload {
  reason: string;
  comments?: string;
  items?: Array<{
    order_item_id: string;
    quantity: number;
  }>;
  images: string[];
}

export interface OrderItemRecord {
  id: string;
  productId?: string;
  orderItemId?: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
  imageUrl: string;
  isReturnable?: boolean;
  isReviewed?: boolean;
}

export interface OrderRecord {
  id: string;
  orderId?: string;
  typeTag: "Express" | "Scheduled" | "Standard" | string;
  date: string;
  branch: string;
  itemsCount: number;
  itemsSummaryText: string;
  statusText: string;
  statusType:
    | "shipped"
    | "packing"
    | "processing"
    | "delivered"
    | "refunded"
    | "cancelled";
  category: OrderTabCategory;
  total: number;
  riderName?: string;
  riderPhone?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  items: OrderItemRecord[];
  rawOrder?: ApiOrder;
  returnWindowExpiresAt?: string | null;
}
