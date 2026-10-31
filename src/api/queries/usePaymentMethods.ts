import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "../services/payment.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { CompletePaymentPayload, PayOrderPayload } from "@/interfaces/payment.interface";
import { useToastStore } from "@/state/toast.store";

export const useGetPaymentMethods = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PAYMENT_METHODS],
    queryFn: () => paymentService.getPaymentMethods(),
    staleTime: 1000 * 60 * 10,
  });
};

export const useCompletePayment = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore.getState();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: CompletePaymentPayload;
    }) => paymentService.completePayment(orderId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER_DETAILS] });
      if (data.outcome === "paid") {
        addToast({
          title: "Payment Successful",
          message: "Your payment has been successfully processed",
          type: "success",
        });
      } else {
        addToast({
          title: "Payment Status",
          message: `Payment status: ${data.outcome}`,
          type: "info",
        });
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error?.message ||
        "Payment verification failed";
      addToast({
        title: "Payment Failed",
        message,
        type: "error",
      });
    },
  });
};

export const usePayOrder = () => {
  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload?: PayOrderPayload;
    }) => paymentService.payOrder(orderId, payload),
  });
};
