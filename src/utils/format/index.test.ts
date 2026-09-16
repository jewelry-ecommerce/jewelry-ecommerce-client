import { describe, expect, it } from "vitest";
import { formatDate, getOrderDate, toVietnamDisplayDate } from "./index";

describe("formatDate (Vietnam timezone)", () => {
  it("maps UTC midnight-boundary to next VN calendar day", () => {
    // 17:00 UTC 12/08 = 00:00 ICT 13/08
    expect(formatDate("2026-08-12T17:00:00.000Z")).toBe("13/08/2026");
  });

  it("keeps date-only YYYY-MM-DD without shifting", () => {
    expect(formatDate("2026-08-12")).toBe("12/08/2026");
  });
});

describe("toVietnamDisplayDate", () => {
  it("formats ISO strings to DD/MM/YYYY in VN", () => {
    expect(toVietnamDisplayDate("2026-08-12T17:00:00.000Z")).toBe("13/08/2026");
  });

  it("keeps YYYY-MM-DD as calendar day", () => {
    expect(toVietnamDisplayDate("2026-08-12")).toBe("12/08/2026");
  });

  it("passes through BE display-ready DD/MM/YYYY", () => {
    expect(toVietnamDisplayDate("12/08/2026")).toBe("12/08/2026");
    expect(toVietnamDisplayDate("15/07/2026")).toBe("15/07/2026");
  });
});

describe("getOrderDate", () => {
  it("formats datetime in Vietnam timezone", () => {
    expect(getOrderDate("2026-08-12T17:00:00.000Z")).toBe("13/08/2026 | 00:00");
  });
});
