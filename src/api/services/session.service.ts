import { apiClient } from "@/utils/apiClient";
import { SESSION_ENDPOINTS } from "../endpoints/session.endpoint";

export const sessionService = {
  getSessionLocation: async () => {
    try {
      const response = await apiClient.get(SESSION_ENDPOINTS.GET_LOCATION);
      return response.data?.data || response.data;
    } catch (error: any) {
      if (error?.response?.status !== 401 && error?.response?.status !== 404) {
        console.warn("Failed to fetch session location:", error);
      }
      return null;
    }
  },

  setLocation: async (data: any) => {
    try {
      const response = await apiClient.post(SESSION_ENDPOINTS.SET_LOCATION, data);
      return response.data;
    } catch (error) {
      console.warn("Failed to set session location:", error);
      return null;
    }
  },

  setLocationByAddressId: async (addressId: string) => {
    try {
      const response = await apiClient.post(SESSION_ENDPOINTS.SET_LOCATION, {
        addressId,
      });
      return response.data;
    } catch (error) {
      console.warn("Failed to set session location by addressId:", error);
      return null;
    }
  },
};
