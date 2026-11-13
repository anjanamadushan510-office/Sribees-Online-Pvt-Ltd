import { PRESENCE_ENDPOINTS } from "../endpoints/presence.endpoint";
import { WebHeartbeat } from "@/interfaces/presence.interface";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { API_BASE_URL } from "@/constants/config";

export const presenceService = {
  /**
   * Report that this browser has the store on screen (Super Admin "App Users",
   * Web filter). Plain fetch with keepalive rather than axios, so the last
   * report still leaves while the tab is closing. Best effort: never throws.
   */
  sendHeartbeat(body: WebHeartbeat): void {
    if (!API_BASE_URL) return;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {
      // Storage blocked: report as a guest.
    }
    fetch(`${API_BASE_URL}${PRESENCE_ENDPOINTS.HEARTBEAT}`, {
      method: "POST",
      headers,
      keepalive: true,
      body: JSON.stringify(body),
    }).catch(() => {
      // Presence must never disturb the shopper.
    });
  },
};
