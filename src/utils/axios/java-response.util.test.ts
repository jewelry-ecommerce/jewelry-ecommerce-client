import { afterEach, expect, test, vi } from "vitest";
import { AxiosHeaders, isAxiosError, type AxiosResponse } from "axios";
import { normalizeJavaAxiosResponse } from "./java-response.util";
const response = (data: unknown): AxiosResponse => ({
  status: 201, statusText: "Created", data, headers: {}, config: { headers: new AxiosHeaders() },
});
afterEach(() => vi.unstubAllEnvs());
test("HTTP 201 with Java business 404 rejects with the real status", () => {
  vi.stubEnv("NEXT_PUBLIC_BACKEND_PROVIDER", "JAVA");
  try {
    normalizeJavaAxiosResponse(response({ status: 404, message: "Sản phẩm không tồn tại", errors: [{ code: "NOT_FOUND" }] }));
    throw new Error("Should reject business failure");
  } catch (error) {
    expect(isAxiosError(error)).toBe(true);
    if (isAxiosError(error)) {
      expect(error.response?.status).toBe(404);
      expect(error.message).toBe("Sản phẩm không tồn tại");
    }
  }
});
test("successful Java responses unwrap but other backend responses remain unchanged", () => {
  vi.stubEnv("NEXT_PUBLIC_BACKEND_PROVIDER", "JAVA");
  expect(normalizeJavaAxiosResponse(response({ status: 200, data: { id: 42 } })).data).toEqual({ id: 42 });
  vi.stubEnv("NEXT_PUBLIC_BACKEND_PROVIDER", "NEST");
  const original = response({ status: 404, message: "unchanged" });
  expect(normalizeJavaAxiosResponse(original)).toBe(original);
});
