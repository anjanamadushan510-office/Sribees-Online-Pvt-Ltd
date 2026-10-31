import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseJwtPayload, isJwtExpired } from "./token.ts";

function createMockJwt(expSeconds: number): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: "user-123",
      exp: expSeconds,
    })
  ).toString("base64url");
  const signature = "mock-signature";
  return `${header}.${payload}.${signature}`;
}

describe("JWT Token Utilities", () => {
  it("should return null / false for invalid or empty tokens", () => {
    assert.equal(parseJwtPayload(null), null);
    assert.equal(parseJwtPayload(undefined), null);
    assert.equal(parseJwtPayload(""), null);
    assert.equal(parseJwtPayload("not-a-jwt"), null);

    assert.equal(isJwtExpired(null), false);
    assert.equal(isJwtExpired(undefined), false);
    assert.equal(isJwtExpired(""), false);
    assert.equal(isJwtExpired("not-a-jwt"), false);
  });

  it("should parse payload correctly", () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const token = createMockJwt(futureExp);
    const payload = parseJwtPayload(token);

    assert.ok(payload);
    assert.equal(payload.sub, "user-123");
    assert.equal(payload.exp, futureExp);
  });

  it("should detect expired token correctly", () => {
    const pastExp = Math.floor(Date.now() / 1000) - 100;
    const expiredToken = createMockJwt(pastExp);
    assert.equal(isJwtExpired(expiredToken), true);
  });

  it("should detect non-expired token correctly", () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const validToken = createMockJwt(futureExp);
    assert.equal(isJwtExpired(validToken), false);
  });
});
