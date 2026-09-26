import { describe, expect, it } from "vitest";
import { DEMO_ACCOUNT_PASSWORD, DEMO_ACCOUNT_PHONE, DEMO_AUTH_COOKIE_VALUE, isDemoCredential, isDemoSession } from "./demo-account";

describe("demo customer account", () => {
  it("accepts only the configured demo credentials", () => {
    expect(isDemoCredential(DEMO_ACCOUNT_PHONE, DEMO_ACCOUNT_PASSWORD)).toBe(true);
    expect(isDemoCredential(DEMO_ACCOUNT_PHONE, "wrong-password")).toBe(false);
    expect(isDemoCredential("unknown", DEMO_ACCOUNT_PASSWORD)).toBe(false);
  });

  it("recognizes only the demo session cookie", () => {
    expect(isDemoSession(DEMO_AUTH_COOKIE_VALUE)).toBe(true);
    expect(isDemoSession(undefined)).toBe(false);
    expect(isDemoSession("invalid")).toBe(false);
  });
});
