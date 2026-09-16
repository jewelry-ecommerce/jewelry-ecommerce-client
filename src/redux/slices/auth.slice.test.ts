import { describe, expect, it, beforeEach, afterEach } from "vitest";
import authReducer, { logOut, setCredentials } from "./auth.slice";
import { GUEST_CART_ID_STORAGE_KEY } from "@/utils/api/cart/guest-cart-id.util";

const initialState = {
  accessToken: null,
  refreshToken: null,
  isLogin: false,
  isResolved: false,
  user: null,
};

describe("auth.slice guest cart id", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(GUEST_CART_ID_STORAGE_KEY, "guest-123");
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("clears guest cart id on logout", () => {
    const loggedIn = authReducer(
      initialState,
      setCredentials({
        user: { id: "user-1", email: "test@example.com", name: "Test" } as never,
      }),
    );

    expect(localStorage.getItem(GUEST_CART_ID_STORAGE_KEY)).toBe("guest-123");

    authReducer(loggedIn, logOut());

    expect(localStorage.getItem(GUEST_CART_ID_STORAGE_KEY)).toBeNull();
  });

  it("does not clear guest cart id on login", () => {
    authReducer(
      initialState,
      setCredentials({
        user: { id: "user-1", email: "test@example.com", name: "Test" } as never,
      }),
    );

    expect(localStorage.getItem(GUEST_CART_ID_STORAGE_KEY)).toBe("guest-123");
  });
});
