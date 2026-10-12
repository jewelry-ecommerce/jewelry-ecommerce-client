import { afterEach, beforeEach, expect, test, vi } from "vitest";
const transport = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock("./content-backend.api", () => ({ requestContentBackend: transport.request }));
import { getContentProducts } from "./content-products.api";
const card = (id: number) => ({ productId: id, productSlug: "product-" + id, selectedSku: { id: id * 10 } });
beforeEach(() => { vi.stubEnv("NEXT_PUBLIC_BACKEND_PROVIDER", "JAVA"); transport.request.mockReset(); });
afterEach(() => vi.unstubAllEnvs());
test("public category/collection use Java parameter names and preserve price queries", async () => {
  transport.request.mockResolvedValue({ list: [card(1)], total: 1, pagination: { currentPage: 1, hasNextPage: false } });
  await getContentProducts({ categorySlug: "rings", collectionSlug: "summer", minPrice: 100, sort: "price_asc" });
  const query = new URLSearchParams(transport.request.mock.calls[0][0].split("?")[1]);
  expect(query.get("category")).toBe("rings"); expect(query.get("collection")).toBe("summer");
  expect(query.has("categorySlug")).toBe(false); expect(query.get("minPrice")).toBe("100");
});
test("manual carousel returns only requested published products and keeps configured order across pages", async () => {
  transport.request.mockImplementation(async (path: string) => new URLSearchParams(path.split("?")[1]).get("page") === "1"
    ? { list: [card(1), card(2)], total: 3, pagination: { currentPage: 1, hasNextPage: true } }
    : { list: [card(3)], total: 3, pagination: { currentPage: 2, hasNextPage: false } });
  const result = await getContentProducts({ productIds: "3,1,99", isPagination: false });
  expect(result.list.map(row => row.productId)).toEqual(["3", "1"]);
  expect(result.total).toBe(2);
  expect(transport.request).toHaveBeenCalledTimes(2);
});
test("invalid product ID never goes to Java", async () => {
  await expect(getContentProducts({ productIds: "uuid-demo" })).rejects.toThrow("số nguyên");
  expect(transport.request).not.toHaveBeenCalled();
});
