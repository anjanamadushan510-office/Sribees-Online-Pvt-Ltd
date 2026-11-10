/**
 * "Now" as the API server reckons it, never the visitor's computer clock.
 *
 * A coupon countdown computed from the device clock lies on any machine set
 * to the wrong time: it shows time left after the server has closed the
 * offer. Every API reply carries a `Date` header (exposed to the browser by
 * the backend's CORS `expose_headers`); we keep the difference between it and
 * the local clock and apply it. Before the first reply the skew is zero.
 *
 * The local clock is still used for elapsed time, which it is good at.
 */
let skewMs = 0;
let synced = false;

export function recordServerDate(header: unknown): void {
  if (typeof header !== "string" || !header) return;
  const server = Date.parse(header);
  if (Number.isNaN(server)) return;
  skewMs = server - Date.now();
  synced = true;
}

/** Milliseconds since the epoch, by the server's clock. */
export function serverNowMs(): number {
  return Date.now() + skewMs;
}

export function serverClockSynced(): boolean {
  return synced;
}

/** Tests only. */
export function setServerSkewForTest(ms: number): void {
  skewMs = ms;
  synced = true;
}
