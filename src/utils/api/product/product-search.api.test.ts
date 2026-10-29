import { beforeEach, afterEach, expect, test, vi } from "vitest";
const mocks = vi.hoisted(() => ({ get: vi.fn(), remove: vi.fn() }));
vi.mock("@/utils/axios", () => ({ commonAxios: { get: mocks.get }, authAxios: { get: mocks.get, delete: mocks.remove } }));
import { deleteSearchHistoryKeyword, getSearchSuggestions } from "./product.api";
beforeEach(() => { vi.clearAllMocks(); mocks.get.mockResolvedValue({ data: [] }); mocks.remove.mockResolvedValue({ data: undefined }); });
afterEach(() => vi.unstubAllEnvs());
test("suggestions keep Vietnamese and reserved characters in query params", async () => {
  await getSearchSuggestions("nhẫn & vòng / vàng");
  expect(mocks.get).toHaveBeenCalledWith("catalog/search/suggestions", { params: { q: "nhẫn & vòng / vàng" } });
});
test("Java deletes a history keyword through the ASCII route and encoded query", async () => {
  vi.stubEnv("NEXT_PUBLIC_BACKEND_PROVIDER", "JAVA");
  await deleteSearchHistoryKeyword("nhẫn / vàng");
  expect(mocks.remove).toHaveBeenCalledWith("catalog/search/history/keyword", { params: { keyword: "nhẫn / vàng" } });
});
test("legacy provider retains its keyword path", async () => {
  vi.stubEnv("NEXT_PUBLIC_BACKEND_PROVIDER", "NEST");
  await deleteSearchHistoryKeyword("nhẫn / vàng");
  expect(mocks.remove).toHaveBeenCalledWith("catalog/search/history/keyword/nh%E1%BA%ABn%20%2F%20v%C3%A0ng", undefined);
});
