import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CartItemData } from "@/utils/api/cart/cart.interface";

vi.mock("@/components/providers.component", () => ({
  useProductDefaultImage: () => "/fallback.png",
}));

vi.mock("@/components/cdn-image", () => ({
  CdnImage: (props: { alt?: string; src?: string }) => React.createElement("img", { alt: props.alt ?? "", src: props.src ?? "" }),
}));

vi.mock("@/components/number-spinner/number-spinner", () => ({
  default: () => React.createElement("div", { "data-testid": "number-spinner" }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.PropsWithChildren<{ href: string }>) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("@mui/material", async () => {
  const actual = await vi.importActual<typeof import("@mui/material")>("@mui/material");
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});

vi.mock("./cart-item.styles", () => {
  const classes = new Proxy(
    {},
    {
      get: (_target, prop) => String(prop),
    },
  ) as Record<string, string>;

  return {
    __esModule: true,
    default: () => ({
      classes,
      cx: (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" "),
    }),
    cartItemGiftImage: { width: 68, height: 88 },
    cartItemLineItemImage: { desktop: { width: 110, height: 130 }, mobile: { width: 96, height: 113.45 } },
  };
});

import { useMediaQuery } from "@mui/material";
import CartItemComponent from "./cart-item.component";

const mockUseMediaQuery = vi.mocked(useMediaQuery);

const createItem = (overrides: Partial<CartItemData> = {}): CartItemData => ({
  productSlug: "product-1",
  id: "item-1",
  image: { src: "/image.png", alt: "Product" },
  name: "Test Product",
  quantity: 1,
  price: {
    current: `1.099.000\u0111`,
    original: `1.790.000\u0111`,
    discountLabel: "-39%",
    discountPercent: 39,
    hasDiscount: true,
    showDiscountPercent: true,
  },
  onQuantityChange: vi.fn(),
  onRemove: vi.fn(),
  ...overrides,
});

describe("CartItemComponent", () => {
  it("shows the discount badge when compare-at is greater than the selling price", () => {
    mockUseMediaQuery.mockReturnValue(false);

    render(React.createElement(CartItemComponent, { item: createItem() }));

    expect(screen.getAllByText("-39%")).toHaveLength(2);
    expect(screen.getAllByText(`1.099.000\u0111`)).toHaveLength(2);
    expect(screen.getAllByText(`1.790.000\u0111`)).toHaveLength(2);
    cleanup();
  });

  it("hides the discount badge when no valid compare-at discount exists", () => {
    mockUseMediaQuery.mockReturnValue(false);

    render(
      React.createElement(CartItemComponent, {
        item: createItem({
          price: {
            current: `1.099.000\u0111`,
            original: undefined,
            discountLabel: undefined,
            discountPercent: undefined,
            hasDiscount: false,
            showDiscountPercent: true,
          },
        }),
      }),
    );

    expect(screen.queryByText("-39%")).toBeNull();
    expect(screen.getAllByText(`1.099.000\u0111`)).toHaveLength(2);
    cleanup();
  });
});
