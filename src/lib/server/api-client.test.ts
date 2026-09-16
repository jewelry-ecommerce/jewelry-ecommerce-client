import { describe, expect, it } from "vitest";

import { shouldRefreshAuth } from "./api-client";

describe("shouldRefreshAuth", () => {
  it("refreshes when body statusCode is 777 even if HTTP is 200", () => {
    expect(shouldRefreshAuth(200, { statusCode: 777, message: "Token expired" })).toBe(true);
  });

  it("refreshes on HTTP 401", () => {
    expect(shouldRefreshAuth(401, { message: "Unauthorized" })).toBe(true);
  });

  it("refreshes when body statusCode is 401", () => {
    expect(shouldRefreshAuth(200, { statusCode: 401 })).toBe(true);
  });

  it("does not refresh on success payload", () => {
    expect(shouldRefreshAuth(200, { id: "user-1" })).toBe(false);
  });

  it("does not refresh on permanent session expiry 888", () => {
    expect(shouldRefreshAuth(401, { statusCode: 888 })).toBe(false);
    expect(shouldRefreshAuth(200, { statusCode: 888 })).toBe(false);
  });

  it("does not refresh on generic 403/500", () => {
    expect(shouldRefreshAuth(403, { statusCode: 403 })).toBe(false);
    expect(shouldRefreshAuth(500, { message: "error" })).toBe(false);
  });
});
