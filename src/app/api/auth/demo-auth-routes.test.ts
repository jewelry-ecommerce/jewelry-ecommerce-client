import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { DEMO_ACCOUNT_PASSWORD, DEMO_ACCOUNT_PHONE, DEMO_AUTH_COOKIE_NAME } from "@/mock-api/demo-account";
import { POST as login } from "./login/route";
import { GET as me } from "./me/route";
import { POST as logout } from "./logout/route";
import { POST as resolvePhone } from "./resolve-phone/route";

const loginRequest = (password: string) =>
  new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone: DEMO_ACCOUNT_PHONE, password }),
  });

describe("demo authentication routes", () => {
  it("routes the demo phone number to the password step", async () => {
    const request = new NextRequest("http://localhost/api/auth/resolve-phone", {
      method: "POST",
      body: JSON.stringify({ phone: DEMO_ACCOUNT_PHONE, recaptchaToken: "demo-recaptcha-token" }),
    });
    const response = await resolvePhone(request);
    expect(response.status).toBe(200);
    expect((await response.json()).flow).toBe("PASSWORD");
  });

  it("rejects an incorrect password", async () => {
    const response = await login(loginRequest("wrong"));
    expect(response.status).toBe(401);
    expect(response.cookies.get(DEMO_AUTH_COOKIE_NAME)).toBeUndefined();
  });

  it("logs in, restores the session and logs out", async () => {
    const loginResponse = await login(loginRequest(DEMO_ACCOUNT_PASSWORD));
    expect(loginResponse.status).toBe(200);
    const sessionCookie = loginResponse.cookies.get(DEMO_AUTH_COOKIE_NAME);
    expect(sessionCookie?.httpOnly).toBe(true);

    const authenticatedRequest = new NextRequest("http://localhost/api/auth/me");
    authenticatedRequest.cookies.set(DEMO_AUTH_COOKIE_NAME, sessionCookie?.value ?? "");
    const profileResponse = await me(authenticatedRequest);
    expect((await profileResponse.json()).user.id).toBe("demo-customer");

    const logoutResponse = await logout();
    expect(logoutResponse.cookies.get(DEMO_AUTH_COOKIE_NAME)?.value).toBe("");
  });
});
