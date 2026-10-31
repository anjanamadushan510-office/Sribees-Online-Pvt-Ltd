export interface ApiPaymentMethod {
  code: string;
  name: string;
  description?: string;
  icon: "cash" | "wallet" | "card" | "bank" | "other" | string;
  kind: "offline" | "wallet" | "online" | string;
}

export interface PaymentMethodsResponse {
  success: boolean;
  data: {
    methods: ApiPaymentMethod[];
  };
}

export interface PaymentAction {
  type: string;
  url: string;
  return_url?: string;
  complete_path?: string;
}

export interface CompletePaymentPayload {
  return_url: string;
}

export interface CompletePaymentResponse {
  success: boolean;
  message: string;
  data: {
    outcome: "paid" | "failed" | "pending" | string;
    [key: string]: unknown;
  };
}

export interface PayOrderPayload {
  method?: string;
}

export interface PayOrderResponse {
  success: boolean;
  data: {
    payment_action: PaymentAction;
  };
}
