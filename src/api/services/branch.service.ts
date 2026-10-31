import { apiClient } from "@/utils/apiClient";
import { BRANCH_ENDPOINTS } from "../endpoints/branch.endpoint";

export interface ResolveBranchPayload {
  province: string;
  district: string;
  postal_city: string;
}

export const DEFAULT_BRANCH_LOCATION: ResolveBranchPayload = {
  province: "Western",
  district: "Kalutara",
  postal_city: "Matugama",
};

export const branchService = {
  resolveByLocation: async (payload?: ResolveBranchPayload) => {
    let body = payload;
    if (!body && typeof window !== "undefined") {
      const savedLoc = localStorage.getItem("sribees_user_location");
      if (savedLoc) {
        try {
          body = JSON.parse(savedLoc);
        } catch {
          // ignore
        }
      }
    }
    if (!body) {
      body = DEFAULT_BRANCH_LOCATION;
    }

    try {
      const response = await apiClient.post(
        BRANCH_ENDPOINTS.RESOLVE_BY_LOCATION,
        body
      );
      if (typeof window !== "undefined" && response.data?.data) {
        localStorage.setItem(
          "sribees_branch_context",
          JSON.stringify(response.data.data)
        );
        localStorage.setItem("sribees_user_location", JSON.stringify(body));
      }
      return response.data;
    } catch (error) {
      console.warn("Failed to resolve branch context with payload, trying default branch:", error);
      // Fallback to active dev branch location if initial location is not served
      if (body !== DEFAULT_BRANCH_LOCATION) {
        const fallbackResponse = await apiClient.post(
          BRANCH_ENDPOINTS.RESOLVE_BY_LOCATION,
          DEFAULT_BRANCH_LOCATION
        );
        if (typeof window !== "undefined" && fallbackResponse.data?.data) {
          localStorage.setItem(
            "sribees_branch_context",
            JSON.stringify(fallbackResponse.data.data)
          );
          localStorage.setItem(
            "sribees_user_location",
            JSON.stringify(DEFAULT_BRANCH_LOCATION)
          );
        }
        return fallbackResponse.data;
      }
      throw error;
    }
  },
};
