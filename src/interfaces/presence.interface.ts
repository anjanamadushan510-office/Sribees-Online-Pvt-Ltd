/** "open" = tab came on screen, "beat" = still on screen, "background" = hidden or closed. */
export type PresenceEvent = "open" | "beat" | "background";

export interface WebHeartbeat {
  /** "web_<uuid>", one per browser, kept in localStorage. */
  device_id: string;
  event: PresenceEvent;
  /** Seconds the tab was on screen since the previous report. */
  foreground_seconds: number;
  platform: "web";
}
