import { create } from "zustand";
import { User, AuthTokens } from "@/interfaces/auth.interface";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { isJwtExpired } from "@/utils/token";

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  setAuth: (user: User, tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false,

  setAuth: (user, tokens) => {
    if (typeof window !== "undefined") {
      if (tokens.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      }
      if (tokens.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      }
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }
    }
    set({
      user,
      accessToken: tokens.accessToken || null,
      refreshToken: tokens.refreshToken || null,
      isAuthenticated: !!tokens.accessToken,
      isInitialized: true,
    });
  },

  setUser: (user) => {
    if (typeof window !== "undefined") {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }
    }
    set({ user });
  },

  setTokens: (tokens) => {
    if (typeof window !== "undefined") {
      if (tokens.accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      }
      if (tokens.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      }
    }
    set({
      accessToken: tokens.accessToken || null,
      refreshToken: tokens.refreshToken || null,
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },

  initAuth: () => {
    if (typeof window === "undefined") return;

    try {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);

      const hasAccessToken = Boolean(
        accessToken &&
          accessToken !== "undefined" &&
          accessToken !== "null" &&
          accessToken.trim().length > 0
      );

      const hasRefreshToken = Boolean(
        refreshToken &&
          refreshToken !== "undefined" &&
          refreshToken !== "null" &&
          refreshToken.trim().length > 0
      );

      // If refresh token is expired, or if access token is expired without a refresh token, session is dead
      const isSessionExpired =
        (hasRefreshToken && isJwtExpired(refreshToken)) ||
        (!hasRefreshToken && hasAccessToken && isJwtExpired(accessToken));

      if (isSessionExpired || (!hasAccessToken && !hasRefreshToken)) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isInitialized: true,
        });
        return;
      }

      if (hasAccessToken) {
        let user: User | null = null;
        if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
          try {
            user = JSON.parse(storedUser) as User;
          } catch {
            user = null;
          }
        }
        set({
          user,
          accessToken,
          refreshToken: hasRefreshToken ? refreshToken : null,
          isAuthenticated: true,
          isInitialized: true,
        });
      } else {
        set({ isInitialized: true });
      }
    } catch {
      set({ isInitialized: true });
    }
  },
}));
