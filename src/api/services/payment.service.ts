import { apiClient } from "@/utils/apiClient";
import { PAYMENT_ENDPOINTS } from "../endpoints/payment.endpoint";
import {
  ApiPaymentMethod,
  PaymentMethodsResponse,
  CompletePaymentPayload,
  CompletePaymentResponse,
  PayOrderPayload,
  PayOrderResponse,
} from "@/interfaces/payment.interface";

export const paymentService = {
  getPaymentMethods: async (): Promise<ApiPaymentMethod[]> => {
    const response = await apiClient.get<PaymentMethodsResponse>(
      PAYMENT_ENDPOINTS.METHODS
    );
    return response.data.data.methods;
  },

  completePayment: async (
    orderId: string,
    payload: CompletePaymentPayload
  ): Promise<CompletePaymentResponse["data"]> => {
    const response = await apiClient.post<CompletePaymentResponse>(
      PAYMENT_ENDPOINTS.COMPLETE_PAYMENT(orderId),
      payload
    );
    return response.data.data;
  },

  payOrder: async (
    orderId: string,
    payload?: PayOrderPayload
  ): Promise<PayOrderResponse["data"]> => {
    const response = await apiClient.post<PayOrderResponse>(
      PAYMENT_ENDPOINTS.PAY_ORDER(orderId),
      payload || {}
    );
    return response.data.data;
  },
};
