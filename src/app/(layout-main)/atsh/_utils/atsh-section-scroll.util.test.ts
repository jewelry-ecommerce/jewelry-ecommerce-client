import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ATSH_SPIRAL_HASH,
  hasAtshSpiralHash,
  isAtshSpiralSectionHash,
  normalizeAtshSpiralHash,
  resetAtshSectionScrollStateForTests,
} from "./atsh-section-scroll.util";

afterEach(() => {
  resetAtshSectionScrollStateForTests();
  vi.unstubAllGlobals();
});

describe("normalizeAtshSpiralHash", () => {
  it("adds leading hash when missing", () => {
    expect(normalizeAtshSpiralHash("24-anh-trai")).toBe("#24-anh-trai");
    expect(normalizeAtshSpiralHash("#24-anh-trai")).toBe("#24-anh-trai");
  });
});

describe("isAtshSpiralSectionHash", () => {
  it("accepts only #24-anh-trai", () => {
    expect(isAtshSpiralSectionHash(ATSH_SPIRAL_HASH)).toBe(true);
    expect(isAtshSpiralSectionHash("24-anh-trai")).toBe(true);
    expect(isAtshSpiralSectionHash("#atsh-spiral-scroll")).toBe(false);
    expect(isAtshSpiralSectionHash("#other")).toBe(false);
    expect(isAtshSpiralSectionHash("")).toBe(false);
  });
});

describe("hasAtshSpiralHash", () => {
  it("reads window.location.hash for deep link /bst-collab-tinhhasayhi#24-anh-trai", () => {
    vi.stubGlobal("window", {
      location: {
        hash: "#24-anh-trai",
        pathname: "/bst-collab-tinhhasayhi",
        search: "",
      },
    });

    expect(hasAtshSpiralHash()).toBe(true);
  });

  it("ignores legacy #atsh-spiral-scroll", () => {
    vi.stubGlobal("window", {
      location: {
        hash: "#atsh-spiral-scroll",
        pathname: "/bst-collab-tinhhasayhi",
        search: "",
      },
    });

    expect(hasAtshSpiralHash()).toBe(false);
  });
});
