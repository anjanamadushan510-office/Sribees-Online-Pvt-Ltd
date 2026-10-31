import { apiClient } from "@/utils/apiClient";
import { ADDRESS_ENDPOINTS } from "../endpoints/address.endpoint";
import {
  ApiAddress,
  GetAddressesResponse,
  CreateAddressRequest,
  CreateAddressResponse,
} from "@/interfaces/address.interface";

export const addressService = {
  getAddresses: async (): Promise<ApiAddress[]> => {
    const response = await apiClient.get<
      GetAddressesResponse | { success: boolean; data: ApiAddress[] }
    >(ADDRESS_ENDPOINTS.USER_ADDRESSES);
    return Array.isArray(response.data?.data) ? response.data.data : [];
  },

  createAddress: async (data: CreateAddressRequest): Promise<ApiAddress> => {
    const response = await apiClient.post<CreateAddressResponse>(
      ADDRESS_ENDPOINTS.USER_ADDRESSES,
      data,
    );
    return response.data.data;
  },

  updateAddress: async (
    id: string,
    data: Partial<CreateAddressRequest>,
  ): Promise<ApiAddress> => {
    const response = await apiClient.put<CreateAddressResponse>(
      ADDRESS_ENDPOINTS.ADDRESS_BY_ID(id),
      data,
    );
    return response.data.data;
  },

  setDefaultAddress: async (id: string): Promise<void> => {
    await apiClient.put(ADDRESS_ENDPOINTS.SET_DEFAULT(id));
  },

  deleteAddress: async (id: string): Promise<void> => {
    await apiClient.delete(ADDRESS_ENDPOINTS.ADDRESS_BY_ID(id));
  },
};
