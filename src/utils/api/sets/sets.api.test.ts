import { describe, expect, it, vi } from "vitest";

const getMock = vi.fn();
const postMock = vi.fn();

vi.mock("@/utils/axios", () => ({
  commonAxios: {
    get: (...args: unknown[]) => getMock(...args),
    post: (...args: unknown[]) => postMock(...args),
  },
}));

const { getSetItemVariations } = await import("./sets.api");

describe("getSetItemVariations", () => {
  it("sends current set selections in the POST body", async () => {
    postMock.mockResolvedValue({ data: { variations: [] } });

    await getSetItemVariations("set-1", "item-2", {
      "item-1": "variation-1",
      "item-2": "variation-2",
    });

    expect(postMock).toHaveBeenCalledWith("catalog/sets/set-1/items/item-2/variations", {
      selections: [
        { itemId: "item-1", variationId: "variation-1" },
        { itemId: "item-2", variationId: "variation-2" },
      ],
    });
  });
});
