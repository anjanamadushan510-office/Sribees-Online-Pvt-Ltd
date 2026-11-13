"use client";

/**
 * Tells the server this browser has the store open, so the Super Admin
 * "App Users" page can show web visitors beside the phone app (Web filter).
 *
 * Same heartbeat as the app, platform "web": "open" when the tab comes on
 * screen, "beat" every 2 minutes while it stays on screen, "background" when
 * it is hidden or closed. Each report carries only the seconds the tab was
 * visible since the last one, so a tab left behind other windows never
 * counts. A signed-in customer is read from the token by the server.
 */
import { useEffect } from "react";
import { presenceService } from "@/api/services/presence.service";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { PresenceEvent } from "@/interfaces/presence.interface";

const BEAT_MS = 2 * 60 * 1000;

function browserId(): string | null {
  try {
    let id = localStorage.getItem(STORAGE_KEYS.WEB_PRESENCE_ID);
    if (!id) {
      const raw =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
      id = `web_${raw}`;
      localStorage.setItem(STORAGE_KEYS.WEB_PRESENCE_ID, id);
    }
    return id;
  } catch {
    // Storage blocked (private mode, settings): not counted, nothing breaks.
    return null;
  }
}

export function useWebPresence(): void {
  useEffect(() => {
    const deviceId = browserId();
    if (!deviceId) return;

    // When the tab last came on screen or last reported; null while hidden.
    let visibleSince: number | null = null;

    const send = (event: PresenceEvent) => {
      const now = Date.now();
      const seconds = visibleSince ? Math.max(0, Math.round((now - visibleSince) / 1000)) : 0;
      visibleSince = event === "background" ? null : now;
      presenceService.sendHeartbeat({
        device_id: deviceId,
        event,
        foreground_seconds: seconds,
        platform: "web",
      });
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (visibleSince === null) send("open");
      } else if (visibleSince !== null) {
        send("background");
      }
    };
    const onPageHide = () => {
      if (visibleSince !== null) send("background");
    };

    if (document.visibilityState === "visible") send("open");
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && visibleSince !== null) send("beat");
    }, BEAT_MS);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      if (visibleSince !== null) send("background");
    };
  }, []);
}
