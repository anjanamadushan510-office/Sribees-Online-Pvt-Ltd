import { create } from "zustand";
import { LocationData } from "@/interfaces/session.interface";
import { STORAGE_KEYS } from "@/constants/storageKeys";

interface SessionStore {
  location: LocationData | null;
  setLocation: (location: LocationData) => void;
  initSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  location: null,

  setLocation: (location) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEYS.LOCATION_DATA,
        JSON.stringify(location),
      );
    }
    set({ location });
  },

  initSession: () => {
    if (typeof window === "undefined") return;

    try {
      const storedLocation = localStorage.getItem(STORAGE_KEYS.LOCATION_DATA);
      if (storedLocation) {
        const location = JSON.parse(storedLocation) as LocationData;
        set({ location });
      }
    } catch {
      // fallback
    }
  },
}));
