import { afterEach, beforeEach, expect, test, vi } from "vitest";

const transport = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), guestId: "" }));
vi.mock("@/utils/axios", () => ({ authAxios: transport }));
vi.mock("./guest-cart-id.util", () => ({
  getGuestCartId: () => transport.guestId,
  setGuestCartId: (id: string) => { transport.guestId = id; },
  clearGuestCartId: () => { transport.guestId = ""; }
}));
vi.mock("./cart.util", () => ({
  withFreshGuestCartHeader: (options: { headers?: Record<string, string> }) => ({
    ...options, headers: { ...options.headers, "x-guest-id": transport.guestId }
  })
}));
import { postCart, getCart } from "./cart.api";

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_BACKEND_PROVIDER", "JAVA");
  transport.guestId = "";
  transport.get.mockResolvedValue({ data: { guestId: "guest-1", items: [] } });
});
afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); });

test("Java cart row ID never becomes a SKU ID for totals, checkout or quantity changes",async()=>{
  transport.get.mockResolvedValue({data:{guestId:"guest-1",items:[{
    id:"804",variationId:"12",productId:"3",quantity:1,found:true,
  }]}});
  expect(await getCart()).toEqual([expect.objectContaining({id:"12",variationId:"12"})]);
});

test("Java uses absolute quantities and carries the newly issued guest ID to the next mutation", async () => {
  transport.put.mockResolvedValue({ data: { guestId: "guest-1", items: [] } });
  await postCart({ items: [{ variationId: "1", quantity: 2 }, { variationId: "2", quantity: 3 }] });
  expect(transport.post).not.toHaveBeenCalled();
  expect(transport.put.mock.calls.map(call => call[1])).toEqual([
    { variationId: "1", quantity: 2 }, { variationId: "2", quantity: 3 }
  ]);
  expect(transport.put.mock.calls[1][2].headers["x-guest-id"]).toBe("guest-1");
});

test("Java clears the cart before setting replacement lines", async () => {
  transport.post.mockResolvedValue({ data: { guestId: "guest-1", items: [] } });
  transport.put.mockResolvedValue({ data: { guestId: "guest-1", items: [] } });
  await postCart({ clearAll: true, items: [{ variationId: "1", quantity: 1 }] });
  expect(transport.post).toHaveBeenCalledWith("cart/cart", { clearAll: true, items: [] }, expect.anything());
  expect(transport.post.mock.invocationCallOrder[0]).toBeLessThan(transport.put.mock.invocationCallOrder[0]);
});

test("Java does not silently drop set products or packaging selections", async () => {
  await expect(postCart({ items: [{ setId: "12", quantity: 1 }] })).rejects.toThrow("Java chưa hỗ trợ");
  expect(transport.post).not.toHaveBeenCalled();
  expect(transport.put).not.toHaveBeenCalled();
});
