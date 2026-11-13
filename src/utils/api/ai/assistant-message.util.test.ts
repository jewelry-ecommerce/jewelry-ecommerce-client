import { describe, expect, it } from "vitest";
import { AI_BUDGET_SCOPE_SET } from "./ai.constant";
import { parseAssistantMessage } from "./assistant-message.util";

describe("parseAssistantMessage", () => {
  it("reads a set request with wedding occasion and budget in millions", () => {
    const parsed = parseAssistantMessage("Phối bộ cưới khoảng 8 triệu, phong cách tối giản");
    expect(parsed.intent).toBe("SET");
    expect(parsed.request.occasion).toBe("Đám cưới");
    expect(parsed.request.budget).toBe(8_000_000);
    expect(parsed.request.budgetScope).toBe(AI_BUDGET_SCOPE_SET);
    expect(parsed.request.style).toEqual(["Tối giản"]);
  });

  it("treats a plain sentence as a single-item recommendation", () => {
    const parsed = parseAssistantMessage("Gợi ý nhẫn sinh nhật khoảng 500k");
    expect(parsed.intent).toBe("RECOMMEND");
    expect(parsed.request.occasion).toBe("Sinh nhật");
    expect(parsed.request.budget).toBe(500_000);
  });
});
