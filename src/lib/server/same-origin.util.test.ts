import { expect, test } from "vitest";
import { isSameOriginRequest } from "./same-origin.util";
test("accepts localhost and loopback only when they match the actual Host", () => {
  expect(isSameOriginRequest("http://127.0.0.1:3101", "127.0.0.1:3101", "http:")).toBe(true);
  expect(isSameOriginRequest("http://localhost:3100", "localhost:3100", "http:")).toBe(true);
});
test("rejects missing, foreign, wrong-port, wrong-scheme and malformed origins", () => {
  for (const origin of [null, "null", "https://evil.test", "http://localhost:3101",
    "https://localhost:3100", "http://localhost:3100/path", "http://user@localhost:3100"]) {
    expect(isSameOriginRequest(origin, "localhost:3100", "http:")).toBe(false);
  }
});
