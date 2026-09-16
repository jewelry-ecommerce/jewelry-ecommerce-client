import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { withFreshGuestCartHeader } from "./cart.util";
import { clearGuestCartId, getGuestCartId, GUEST_CART_ID_STORAGE_KEY, setGuestCartId } from "./guest-cart-id.util";

describe("guest-cart-id.util", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns null when guest id is not stored", () => {
    expect(getGuestCartId()).toBeNull();
  });

  it("stores and reads guest id", () => {
    setGuestCartId("ed4c2ff7-60e3-4566-a300-84be172b4dd3");
    expect(getGuestCartId()).toBe("ed4c2ff7-60e3-4566-a300-84be172b4dd3");
    expect(localStorage.getItem(GUEST_CART_ID_STORAGE_KEY)).toBe("ed4c2ff7-60e3-4566-a300-84be172b4dd3");
  });

  it("overwrites existing guest id", () => {
    setGuestCartId("guest-old");
    setGuestCartId("guest-new");
    expect(getGuestCartId()).toBe("guest-new");
  });

  it("clears guest id", () => {
    setGuestCartId("guest-1");
    clearGuestCartId();
    expect(getGuestCartId()).toBeNull();
  });

  it("ignores empty guest id when setting", () => {
    setGuestCartId("");
    expect(getGuestCartId()).toBeNull();
  });
});

describe("withFreshGuestCartHeader", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("overrides stale x-guest-id with latest localStorage value", () => {
    setGuestCartId("guest-latest");

    expect(
      withFreshGuestCartHeader({
        skipAuthLogout: true,
        headers: { "x-guest-id": "guest-stale" },
      }),
    ).toEqual({
      skipAuthLogout: true,
      headers: { "x-guest-id": "guest-latest" },
    });
  });

  it("omits headers when guest id is not stored", () => {
    expect(withFreshGuestCartHeader({ skipAuthLogout: false, headers: { "x-guest-id": "guest-stale" } })).toEqual({
      skipAuthLogout: false,
    });
  });
});
