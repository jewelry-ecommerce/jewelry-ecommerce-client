import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CheckoutRequestLineType, type CheckoutSessionSetItem } from "@/utils/api/checkout/checkout.interface";

vi.mock("swr", () => ({ default: () => ({ data: undefined }) }));

vi.mock("@/components/providers.component", () => ({
  useProductDefaultImage: () => "/fallback.png",
}));

vi.mock("@/components/cdn-image", () => ({
  CdnImage: (props: { alt?: string; src?: string }) => React.createElement("img", { alt: props.alt ?? "", src: props.src ?? "" }),
}));

vi.mock("@/app/(layout-main)/sets/_components/set-badge.component", () => ({
  default: ({ productCount }: { productCount: number }) => React.createElement("span", null, `Set ${productCount} sản phẩm`),
}));

vi.mock("@/app/(layout-main)/sets/_components/set-key-badge.component", () => ({
  default: () => null,
}));

vi.mock("./checkout-set-item.styles", () => {
  const classes = new Proxy({}, { get: (_target, property) => String(property) }) as Record<string, string>;
  return { default: () => ({ classes }) };
});

import CheckoutSetItem from "./checkout-set-item.component";

const setItem: CheckoutSessionSetItem = {
  type: CheckoutRequestLineType.SET,
  lineId: "line-1",
  setId: "set-1",
  name: "Set Dopamine",
  image: "/set.png",
  quantity: 2,
  subtotalMinor: 10_568_888,
  compareAtSubtotalMinor: 13_568_888,
  components: [],
};

afterEach(cleanup);

describe("CheckoutSetItem", () => {
  it("shows the Set quantity on its image", () => {
    render(<CheckoutSetItem item={setItem} />);

    const quantityBadge = screen.getByText("2");
    expect(quantityBadge.className).toContain("quantityBadge");
    expect(quantityBadge.parentElement?.querySelector('img[alt="Set Dopamine"]')).not.toBeNull();
  });
});
