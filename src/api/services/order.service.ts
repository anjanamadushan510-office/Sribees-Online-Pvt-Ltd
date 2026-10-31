import { apiClient } from "@/utils/apiClient";
import { ORDER_ENDPOINTS } from "../endpoints/order.endpoint";
import {
  ApiOrder,
  GetOrdersResponse,
  GetOrderDetailsResponse,
  OrderQuotePayload,
  OrderQuoteResponse,
  CreateOrderPayload,
  CreateOrderResponse,
  ReturnImageResponse,
  ReturnOrderPayload,
} from "@/interfaces/order.interface";

export const orderService = {
  getOrders: async (
    page = 1,
    limit = 20,
    status?: string
  ): Promise<GetOrdersResponse["data"]> => {
    let url = `${ORDER_ENDPOINTS.ORDERS}?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    const response = await apiClient.get<GetOrdersResponse>(url);
    return response.data.data;
  },

  getOrderById: async (id: string): Promise<ApiOrder> => {
    const response = await apiClient.get<GetOrderDetailsResponse>(
      ORDER_ENDPOINTS.ORDER_BY_ID(id)
    );
    return response.data.data;
  },

  quoteOrder: async (
    payload: OrderQuotePayload
  ): Promise<OrderQuoteResponse["data"]> => {
    const response = await apiClient.post<OrderQuoteResponse>(
      ORDER_ENDPOINTS.QUOTE,
      payload
    );
    return response.data.data;
  },

  createOrder: async (
    payload: CreateOrderPayload
  ): Promise<CreateOrderResponse["data"]> => {
    const response = await apiClient.post<CreateOrderResponse>(
      ORDER_ENDPOINTS.ORDERS,
      payload
    );
    return response.data.data;
  },

  cancelOrder: async (id: string, reason?: string): Promise<ApiOrder> => {
    const url = `${ORDER_ENDPOINTS.CANCEL_ORDER(id)}${
      reason ? `?reason=${encodeURIComponent(reason)}` : ""
    }`;
    const response = await apiClient.post<GetOrderDetailsResponse>(url);
    return response.data.data;
  },

  trackOrder: async (id: string): Promise<any> => {
    const response = await apiClient.get(ORDER_ENDPOINTS.TRACKING(id));
    return response.data.data;
  },

  reorder: async (id: string, items?: Array<{ order_item_id: string; quantity: number }>): Promise<any> => {
    const response = await apiClient.post(ORDER_ENDPOINTS.REORDER(id), items ? { items } : {});
    return response.data.data;
  },

  downloadInvoice: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(ORDER_ENDPOINTS.INVOICE(id), {
      responseType: "blob",
    });
    return response.data;
  },

  uploadReturnImage: async (
    id: string,
    file: File
  ): Promise<{ path: string; url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<ReturnImageResponse>(
      ORDER_ENDPOINTS.RETURN_IMAGES(id),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  requestReturn: async (
    id: string,
    payload: ReturnOrderPayload
  ): Promise<ApiOrder> => {
    const response = await apiClient.post<GetOrderDetailsResponse>(
      ORDER_ENDPOINTS.RETURN(id),
      payload
    );
    return response.data.data;
  },
};
