import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services/order.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useAuthStore } from "@/state/auth.store";
import {
  OrderQuotePayload,
  CreateOrderPayload,
  ReturnOrderPayload,
} from "@/interfaces/order.interface";
import { useToastStore } from "@/state/toast.store";

export const useGetOrders = (page = 1, limit = 20, status?: string) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.ORDERS, page, limit, status],
    queryFn: () => orderService.getOrders(page, limit, status),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });
};

export const useGetOrder = (id: string) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.ORDER_DETAILS, id],
    queryFn: () => orderService.getOrderById(id),
    enabled: isAuthenticated && Boolean(id),
  });
};

export const useQuoteOrder = () => {
  return useMutation({
    mutationFn: (payload: OrderQuotePayload) => orderService.quoteOrder(payload),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore.getState();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderService.createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART_COUNT] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WALLET_BALANCE] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error?.message ||
        "Failed to place order";
      addToast({
        title: "Checkout Error",
        message,
        type: "error",
      });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore.getState();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      orderService.cancelOrder(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER_DETAILS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WALLET_BALANCE] });
      addToast({
        title: "Order Cancelled",
        message: "Your order has been cancelled successfully",
        type: "info",
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error?.message ||
        "Failed to cancel order";
      addToast({
        title: "Cancellation Error",
        message,
        type: "error",
      });
    },
  });
};

export const useTrackOrder = (id: string, enabled = true) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: [QUERY_KEYS.ORDER_TRACKING, id],
    queryFn: () => orderService.trackOrder(id),
    enabled: isAuthenticated && Boolean(id) && enabled,
    refetchInterval: 60000,
  });
};

export const useReorder = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore.getState();

  return useMutation({
    mutationFn: ({
      id,
      items,
    }: {
      id: string;
      items?: Array<{ order_item_id: string; quantity: number }>;
    }) => orderService.reorder(id, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CART_COUNT] });
      addToast({
        title: "Reordered",
        message: "Items added to your cart",
        type: "success",
      });
    },
  });
};

export const useDownloadInvoice = () => {
  const { addToast } = useToastStore.getState();

  return useMutation({
    mutationFn: (id: string) => orderService.downloadInvoice(id),
    onSuccess: (blob: Blob, id: string) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast({
        title: "Invoice Downloaded",
        message: `Invoice for order #${id} downloaded successfully`,
        type: "success",
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error?.message ||
        "Failed to download invoice";
      addToast({
        title: "Download Failed",
        message,
        type: "error",
      });
    },
  });
};

export const useUploadReturnImage = () => {
  const { addToast } = useToastStore.getState();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      orderService.uploadReturnImage(id, file),
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error?.message ||
        "Failed to upload return photo. Please ensure it is JPEG, PNG or WebP under 5MB.";
      addToast({
        title: "Upload Failed",
        message,
        type: "error",
      });
    },
  });
};

export const useRequestReturn = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore.getState();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ReturnOrderPayload;
    }) => orderService.requestReturn(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDER_DETAILS, variables.id],
      });
      addToast({
        title: "Return Requested",
        message: "Your return request has been submitted for branch review.",
        type: "success",
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error?.message ||
        "Failed to submit return request";
      addToast({
        title: "Return Request Error",
        message,
        type: "error",
      });
    },
  });
};
