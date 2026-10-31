import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { useAuthStore } from "@/state/auth.store";
import { API_BASE_URL } from "@/constants/config";
import { isJwtExpired } from "@/utils/token";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token & Device ID
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      let deviceId = localStorage.getItem("x_device_id");
      if (!deviceId) {
        deviceId =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : "dev-" + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("x_device_id", deviceId);
      }

      if (config.headers) {
        config.headers["X-Device-Id"] = deviceId;
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Auto Token Refresh on 401 & Auto Branch Context Resolution on 400
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // 1. Handle 401 Unauthorized (Token Refresh)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
          : null;

      // If there is no refresh token or the refresh token is expired, clean up session cleanly
      if (!storedRefreshToken || isJwtExpired(storedRefreshToken)) {
        isRefreshing = false;
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        }
        useAuthStore.getState().logout();
        processQueue(error, null);
        return Promise.reject(error);
      }

      try {
        // The API takes `refresh_token` and answers with the new pair nested
        // under `tokens` (WEB_STOREFRONT_API.md 5.3).
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: storedRefreshToken,
          refreshToken: storedRefreshToken,
        });

        const resData = response.data?.data || response.data;
        const tokens = response.data?.tokens || resData?.tokens || resData;
        const accessToken =
          tokens?.accessToken ||
          tokens?.access_token ||
          resData?.accessToken ||
          resData?.access_token ||
          resData?.token;
        const newRefreshToken =
          tokens?.refreshToken ||
          tokens?.refresh_token ||
          resData?.refreshToken ||
          resData?.refresh_token;

        if (!accessToken) {
          throw new Error("No access token returned from refresh API");
        }

        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          if (newRefreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
          }
        }

        useAuthStore.getState().setTokens({
          accessToken,
          refreshToken: newRefreshToken || storedRefreshToken,
        });

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        }
        useAuthStore.getState().logout();
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 2. Handle 400 Bad Request (NO_BRANCH_CONTEXT auto-resolution)
    const errorData = error.response?.data as any;
    const isNoBranchContext =
      error.response?.status === 400 &&
      (errorData?.error_code === "NO_BRANCH_CONTEXT" ||
        errorData?.detail?.includes?.("NO_BRANCH_CONTEXT") ||
        errorData?.detail?.includes?.("branch") ||
        originalRequest.url?.includes("/products") ||
        originalRequest.url?.includes("/banners"));

    if (isNoBranchContext && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        let deviceId =
          typeof window !== "undefined"
            ? localStorage.getItem("x_device_id")
            : null;

        if (!deviceId) {
          deviceId =
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : "dev-" + Math.random().toString(36).substring(2, 15);
          if (typeof window !== "undefined") {
            localStorage.setItem("x_device_id", deviceId);
          }
        }

        const defaultLocation = {
          province: "Western",
          district: "Kalutara",
          postal_city: "Matugama",
        };

        let userLocation = defaultLocation;
        if (typeof window !== "undefined") {
          const savedLoc = localStorage.getItem("sribees_user_location");
          if (savedLoc) {
            try {
              userLocation = JSON.parse(savedLoc);
            } catch {
              // fallback
            }
          }
        }

        // Resolve branch location for guest device session
        try {
          await axios.post(
            `${API_BASE_URL}/branch/resolve-by-location`,
            userLocation,
            {
              headers: {
                "Content-Type": "application/json",
                "X-Device-Id": deviceId,
              },
            },
          );
        } catch {
          // If custom userLocation returned 404, fallback to known dev branch location
          await axios.post(
            `${API_BASE_URL}/branch/resolve-by-location`,
            defaultLocation,
            {
              headers: {
                "Content-Type": "application/json",
                "X-Device-Id": deviceId,
              },
            },
          );
        }

        if (originalRequest.headers) {
          originalRequest.headers["X-Device-Id"] = deviceId;
        }

        return apiClient(originalRequest);
      } catch (resolveError) {
        console.warn(
          "Auto branch resolution failed:",
          resolveError instanceof Error ? resolveError.message : "Error",
        );
      }
    }

    return Promise.reject(error);
  },
);
