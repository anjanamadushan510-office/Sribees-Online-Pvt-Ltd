"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import { Clock } from "lucide-react";
import { CouponExpiry } from "@/interfaces/coupon.interface";
import { serverNowMs } from "@/utils/serverClock";
import { countdownParts } from "@/utils/couponCountdown";

/*
 * One shared one-second tick for every countdown on the page. The interval
 * runs only while a countdown is mounted, and pauses while the tab is hidden.
 */
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let tick = 0;

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    timer = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      tick += 1;
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function useSecondTick(enabled: boolean): number {
  return useSyncExternalStore(
    enabled ? subscribe : () => () => {},
    () => tick,
    () => 0,
  );
}


interface Props {
  expiry: CouponExpiry;
  /** Called once when a timer reaches zero (reload: the server now calls it ended). */
  onEnded?: () => void;
  /** Tailwind text colour class for the digits. */
  tone?: string;
  compact?: boolean;
}

export const CouponCountdown: React.FC<Props> = ({
  expiry,
  onEnded,
  tone = "text-[#E5480B]",
  compact = false,
}) => {
  const isTimer = expiry.mode === "timer";
  useSecondTick(isTimer);
  const endsAt = Date.parse(expiry.ends_at);
  const reported = useRef(false);
  const now = serverNowMs();
  const over = isTimer && !Number.isNaN(endsAt) && now >= endsAt;

  useEffect(() => {
    if (over && !reported.current) {
      reported.current = true;
      onEnded?.();
    }
  }, [over, onEnded]);

  const size = compact ? "text-[11px]" : "text-xs";

  if (!isTimer || Number.isNaN(endsAt)) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${size} font-semibold text-slate-500`}>
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        {expiry.text}
      </span>
    );
  }

  const parts = countdownParts(endsAt, now);
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${size} font-semibold text-slate-500`}
      role="timer"
      aria-label={`${expiry.text} ${parts.join(":")}`}
    >
      <span aria-hidden>{expiry.text}</span>
      <span className="inline-flex items-center gap-0.5" aria-hidden>
        {parts.map((p, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className={`font-black ${tone}`}>:</span>}
            <span
              className={`px-1 py-px rounded border border-current/30 bg-current/5 font-black tabular-nums ${tone}`}
            >
              {p}
            </span>
          </React.Fragment>
        ))}
      </span>
    </span>
  );
};

export const CouponNewBadge: React.FC<{ text: string }> = ({ text }) => (
  <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-md bg-orange-50 text-[#E5480B]">
    {text}
  </span>
);
