"use client";

import { useWebPresence } from "@/hooks/useWebPresence";

/** Renders nothing: reports that the store is on screen (see useWebPresence). */
export function WebPresence() {
  useWebPresence();
  return null;
}
