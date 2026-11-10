import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { countdownParts } from "./couponCountdown.ts";
import { recordServerDate, serverNowMs, serverClockSynced } from "./serverClock.ts";

describe("coupon countdown", () => {
  const start = Date.UTC(2026, 10, 10, 6, 0, 0);

  it("runs hours past 24 for a 72-hour coupon", () => {
    const end = start + ((71 * 60 + 59) * 60 + 59) * 1000;
    assert.deepEqual(countdownParts(end, start), ["71", "59", "59"]);
  });

  it("stops at zero instead of going negative", () => {
    assert.deepEqual(countdownParts(start, start + 5000), ["00", "00", "00"]);
  });
});

describe("server clock", () => {
  it("ignores a missing or garbled Date header", () => {
    recordServerDate(undefined);
    recordServerDate("not a date");
    assert.equal(serverClockSynced(), false);
  });

  it("follows the server, not this computer", () => {
    const anHourAhead = new Date(Date.now() + 3600_000).toUTCString();
    recordServerDate(anHourAhead);
    assert.equal(serverClockSynced(), true);
    const drift = serverNowMs() - Date.now();
    assert.ok(Math.abs(drift - 3600_000) < 2000, `drift ${drift}`);
  });
});
