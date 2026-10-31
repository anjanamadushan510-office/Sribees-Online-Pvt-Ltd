import { apiClient } from "@/utils/apiClient";
import { LOCATION_ENDPOINTS } from "../endpoints/location.endpoint";

export interface ProvinceItem {
  province: string;
  displayName?: Record<string, string>;
  available?: boolean;
  comingSoon?: boolean;
}

export interface DistrictItem {
  district: string;
  province: string;
  displayName?: Record<string, string>;
  available?: boolean;
  comingSoon?: boolean;
}

export interface PostalCityItem {
  postalCity: string;
  postOffice?: string;
  district: string;
  province: string;
  branchId?: string;
  branchName?: string;
  isActive?: boolean;
}

export const locationService = {
  getProvinces: async (): Promise<ProvinceItem[]> => {
    try {
      const response = await apiClient.get(LOCATION_ENDPOINTS.GET_PROVINCES, {
        params: { include_upcoming: true },
      });
      const data = response.data?.data || response.data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (error) {
      console.warn("Failed to fetch provinces from API:", error);
    }
    return [
      { province: "Western", available: true },
      { province: "Central", comingSoon: true },
      { province: "Southern", comingSoon: true },
    ];
  },

  getDistricts: async (province: string): Promise<DistrictItem[]> => {
    try {
      const response = await apiClient.get(LOCATION_ENDPOINTS.GET_DISTRICTS, {
        params: { province, include_upcoming: true },
      });
      const data = response.data?.data || response.data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (error) {
      console.warn(`Failed to fetch districts for ${province}:`, error);
    }
    return [{ district: "Kalutara", province: "Western", available: true }];
  },

  getPostalCities: async (district: string): Promise<PostalCityItem[]> => {
    try {
      const response = await apiClient.get(
        LOCATION_ENDPOINTS.GET_POSTAL_CITIES,
        {
          params: { district },
        }
      );
      const data = response.data?.data || response.data;
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (error) {
      console.warn(`Failed to fetch postal cities for ${district}:`, error);
    }
    return [
      { postalCity: "Matugama", district: "Kalutara", province: "Western" },
      { postalCity: "Welipenna", district: "Kalutara", province: "Western" },
      { postalCity: "Agalawatta", district: "Kalutara", province: "Western" },
      { postalCity: "Dodangoda", district: "Kalutara", province: "Western" },
      { postalCity: "Meegahathanna", district: "Kalutara", province: "Western" },
    ];
  },
};
