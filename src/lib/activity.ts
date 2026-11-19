/**
 * What the shopper does on the web store (owner, 2026-11-19): pages with time
 * on screen and scroll depth, products opened, searches, cart and wishlist
 * changes, coupons, orders. Same log as the phone app — sent in batches to
 * POST /app/activity/batch with platform "web"; Super Admin reads it as a
 * timeline (Customers drawer → Activity).
 *
 * Rules (backend docs/plans/customer-activity-log.md):
 * - Never disturbs the shopper: every failure is silent, the queue is bounded.
 * - Never passwords, OTPs, card data, typed addresses or chat text.
 * - Names only this browser (the presence id); the server reads the customer
 *   from the token, so browsing as a guest joins the account at sign-in.
 */
import { API_BASE_URL } from "@/constants/config";
import { STORAGE_KEYS } from "@/constants/storageKeys";

type Value = string | number | boolean | null | undefined;

interface QueuedEvent {
  event: string;
  occurred_at: string;
  screen?: string;
  product_id?: string;
  category_id?: string;
  props?: Record<string, string | number | boolean>;
}

const ENDPOINT = "/app/activity/batch";
const QUEUE_KEY = "sribees_activity_queue_v1";
const FLUSH_MS = 30 * 1000;
const FLUSH_AT = 50;
const BATCH_MAX = 100;
const QUEUE_CAP = 2000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let queue: QueuedEvent[] = [];
let timer: number | null = null;
let restored = false;
const session = `w${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

// The page on show, for time on page and scroll depth.
let page: { name: string; since: number; maxPct: number; maxPx: number } | null = null;

/** The same id the presence heartbeat uses (useWebPresence). */
export function browserId(): string | null {
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
    return null;
  }
}

function restore() {
  if (restored || typeof window === "undefined") return;
  restored = true;
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (raw) queue = [...(JSON.parse(raw) as QueuedEvent[]), ...queue].slice(-QUEUE_CAP);
  } catch {
    try {
      localStorage.removeItem(QUEUE_KEY);
    } catch {
      /* storage blocked */
    }
  }
}

function save() {
  try {
    if (queue.length) localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    else localStorage.removeItem(QUEUE_KEY);
  } catch {
    /* storage blocked or full: the in-memory queue still goes out */
  }
}

/** Record one event. Never throws. */
export function logActivity(
  event: string,
  opts: { productId?: string | null; categoryId?: string | null; screen?: string; props?: Record<string, Value> } = {},
): void {
  if (typeof window === "undefined") return;
  try {
    restore();
    const props: Record<string, string | number | boolean> = {};
    for (const [k, v] of Object.entries(opts.props ?? {})) {
      if (v === null || v === undefined) continue;
      props[k] = typeof v === "string" ? v.slice(0, 200) : v;
    }
    queue.push({
      event,
      occurred_at: new Date().toISOString(),
      ...(opts.screen ? { screen: opts.screen } : {}),
      ...(opts.productId && UUID.test(opts.productId) ? { product_id: opts.productId } : {}),
      ...(opts.categoryId && UUID.test(opts.categoryId) ? { category_id: opts.categoryId } : {}),
      ...(Object.keys(props).length ? { props } : {}),
    });
    if (queue.length > QUEUE_CAP) queue = queue.slice(-QUEUE_CAP);
    if (queue.length >= FLUSH_AT) flushActivity();
    else save();
  } catch {
    /* never disturb the shopper */
  }
}

/**
 * Send what is queued, oldest first. keepalive so it still leaves while the
 * tab closes. The token is read now: call before a sign-in stores a new one,
 * so guest browsing goes out as the guest's.
 */
export function flushActivity(): void {
  if (typeof window === "undefined" || !API_BASE_URL) return;
  restore();
  const deviceId = browserId();
  if (!deviceId || queue.length === 0) return;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {
    /* as a guest */
  }
  while (queue.length) {
    const batch = queue.slice(0, BATCH_MAX);
    queue = queue.slice(BATCH_MAX);
    fetch(`${API_BASE_URL}${ENDPOINT}`, {
      method: "POST",
      headers,
      keepalive: true,
      body: JSON.stringify({ device_id: deviceId, platform: "web", session_id: session, events: batch }),
    })
      .then((r) => {
        // A refusal (bad event) is dropped; only a network/server failure is retried.
        if (r.status >= 500 || r.status === 429) requeue(batch);
      })
      .catch(() => requeue(batch));
  }
  save();
}

function requeue(batch: QueuedEvent[]) {
  queue = [...batch, ...queue].slice(-QUEUE_CAP);
  save();
}

// ── Pages ────────────────────────────────────────────────────────────────

export function pageShown(name: string): void {
  if (page?.name === name) return;
  pageHidden();
  page = { name, since: Date.now(), maxPct: 0, maxPx: 0 };
}

export function pageHidden(): void {
  const p = page;
  page = null;
  if (!p) return;
  const seconds = (Date.now() - p.since) / 1000;
  if (seconds < 0.5) return;
  logActivity("screen", {
    screen: p.name,
    props: {
      seconds: Math.round(seconds * 10) / 10,
      scroll_pct: p.maxPx > 0 ? Math.round(p.maxPct) : undefined,
      scroll_px: p.maxPx > 0 ? Math.round(p.maxPx) : undefined,
    },
  });
}

export function pageScrolled(): void {
  if (!page) return;
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  const y = window.scrollY;
  if (y > page.maxPx) page.maxPx = y;
  if (max > 0) page.maxPct = Math.max(page.maxPct, Math.min(100, (y / max) * 100));
}

/** Start the 30-second timer once per tab. */
export function startActivity(): () => void {
  if (typeof window === "undefined" || timer !== null) return () => undefined;
  restore();
  timer = window.setInterval(flushActivity, FLUSH_MS);
  return () => {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  };
}
