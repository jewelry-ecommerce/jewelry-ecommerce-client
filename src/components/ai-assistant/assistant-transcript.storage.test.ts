import { describe, expect, it } from "vitest";
import { ASSISTANT_TRANSCRIPT_MAX_MESSAGES, ASSISTANT_TRANSCRIPT_RETENTION_DAYS, ASSISTANT_TRANSCRIPT_STORAGE_KEY } from "@/utils/api/ai/ai.constant";
import {
  assistantModelHistory,
  readAssistantTranscript,
  withoutLeadingGreeting,
  writeAssistantTranscript,
  type AssistantTranscriptTurn,
} from "./assistant-transcript.storage";

const memory = () => {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
    removeItem: (key: string) => { data.delete(key); },
  };
};

const turn = (role: "user" | "assistant", text: string): AssistantTranscriptTurn => ({ role, text });

describe("assistant transcript storage", () => {
  it("keeps the conversation after a reload and drops it after 30 days", () => {
    const store = memory();
    const now = Date.parse("2026-11-18T00:00:00Z");
    writeAssistantTranscript([turn("user", "tôi cần nhẫn"), turn("assistant", "Shop có nhẫn bạc ạ.")], store, now);
    expect(readAssistantTranscript(store, now).map((item) => item.text)).toEqual(["tôi cần nhẫn", "Shop có nhẫn bạc ạ."]);
    const expired = now + (ASSISTANT_TRANSCRIPT_RETENTION_DAYS + 1) * 24 * 60 * 60 * 1000;
    expect(readAssistantTranscript(store, expired)).toEqual([]);
    expect(store.getItem(ASSISTANT_TRANSCRIPT_STORAGE_KEY)).toBeNull();
  });

  it("keeps only the newest 100 bubbles", () => {
    const store = memory();
    const turns = Array.from({ length: ASSISTANT_TRANSCRIPT_MAX_MESSAGES + 5 }, (_, index) => turn("user", `câu ${index}`));
    writeAssistantTranscript(turns, store, 1);
    const stored = readAssistantTranscript(store, 1);
    expect(stored).toHaveLength(ASSISTANT_TRANSCRIPT_MAX_MESSAGES);
    expect(stored[0]?.text).toBe("câu 5");
  });

  it("sends the ten newest turns and the product names on the cards", () => {
    const greeting = turn("assistant", "Xin chào");
    const turns = [greeting];
    for (let index = 0; index < 12; index += 1) {
      turns.push(turn("user", `câu ${index}`), turn("assistant", `trả lời ${index}`));
    }
    turns.push({ role: "assistant", text: "Shop gợi ý nhẫn này ạ.", cards: [{ id: 1, name: "Nhẫn bạc", price: 1000, image: null, href: "/san-pham/nhan-bac" }] });
    const history = assistantModelHistory(withoutLeadingGreeting(turns, greeting.text));
    expect(history).toHaveLength(20);
    expect(history[0]?.content).toBe("trả lời 2");
    expect(history.at(-1)?.content).toContain("Nhẫn bạc");
  });
});
