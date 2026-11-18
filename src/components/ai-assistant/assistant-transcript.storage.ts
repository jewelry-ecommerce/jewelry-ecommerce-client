import type { AssistantCard } from "@/components/ai-assistant/assistant-ask";
import {
  ASSISTANT_CONTEXT_TURNS,
  ASSISTANT_HISTORY_CONTENT_MAX,
  ASSISTANT_TRANSCRIPT_MAX_MESSAGES,
  ASSISTANT_TRANSCRIPT_RETENTION_DAYS,
  ASSISTANT_TRANSCRIPT_STORAGE_KEY,
} from "@/utils/api/ai/ai.constant";
import type { AssistantHistoryItem } from "@/utils/api/ai/ai.interface";

export type AssistantTranscriptTurn = {
  role: "user" | "assistant";
  text: string;
  cards?: AssistantCard[];
  setPath?: string;
};

type TranscriptStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const RETENTION_MS = ASSISTANT_TRANSCRIPT_RETENTION_DAYS * 24 * 60 * 60 * 1000;

const browserStore = (): TranscriptStore | null => (typeof window === "undefined" ? null : window.localStorage);

export const withoutLeadingGreeting = (turns: AssistantTranscriptTurn[], greetingText: string): AssistantTranscriptTurn[] =>
  turns[0]?.role === "assistant" && turns[0].text === greetingText ? turns.slice(1) : turns;

export const readAssistantTranscript = (storage: TranscriptStore | null = browserStore(), now = Date.now()): AssistantTranscriptTurn[] => {
  if (!storage) return [];
  try {
    const raw = storage.getItem(ASSISTANT_TRANSCRIPT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { savedAt?: unknown; turns?: unknown };
    if (typeof parsed.savedAt !== "number" || now - parsed.savedAt > RETENTION_MS) {
      storage.removeItem(ASSISTANT_TRANSCRIPT_STORAGE_KEY);
      return [];
    }
    return normalize(parsed.turns);
  } catch {
    return [];
  }
};

export const writeAssistantTranscript = (
  turns: AssistantTranscriptTurn[],
  storage: TranscriptStore | null = browserStore(),
  now = Date.now(),
): void => {
  if (!storage) return;
  const payload = JSON.stringify({ savedAt: now, turns: turns.slice(-ASSISTANT_TRANSCRIPT_MAX_MESSAGES) });
  try {
    storage.setItem(ASSISTANT_TRANSCRIPT_STORAGE_KEY, payload);
  } catch {
    storage.removeItem(ASSISTANT_TRANSCRIPT_STORAGE_KEY);
  }
};

export const assistantModelHistory = (turns: AssistantTranscriptTurn[]): AssistantHistoryItem[] =>
  turns.slice(-ASSISTANT_CONTEXT_TURNS * 2).flatMap((turn) => {
    const content = contentOf(turn);
    return content ? [{ role: turn.role, content }] : [];
  });

const contentOf = (turn: AssistantTranscriptTurn): string => {
  const names = (turn.cards ?? []).map((card) => card.name.trim()).filter((name) => name.length > 0);
  const body = names.length === 0 ? turn.text : `${turn.text}\nSản phẩm: ${names.join(", ")}`;
  return body.trim().slice(0, ASSISTANT_HISTORY_CONTENT_MAX);
};

const normalize = (value: unknown): AssistantTranscriptTurn[] => {
  if (!Array.isArray(value)) return [];
  const turns: AssistantTranscriptTurn[] = [];
  for (const item of value) {
    const turn = asTurn(item);
    if (turn) turns.push(turn);
  }
  return turns.slice(-ASSISTANT_TRANSCRIPT_MAX_MESSAGES);
};

const asTurn = (value: unknown): AssistantTranscriptTurn | null => {
  if (!value || typeof value !== "object") return null;
  const item = value as { role?: unknown; text?: unknown; cards?: unknown; setPath?: unknown };
  if ((item.role !== "user" && item.role !== "assistant") || typeof item.text !== "string" || item.text.trim().length === 0) {
    return null;
  }
  const turn: AssistantTranscriptTurn = { role: item.role, text: item.text };
  const cards = asCards(item.cards);
  if (cards.length > 0) turn.cards = cards;
  if (typeof item.setPath === "string" && item.setPath.length > 0) turn.setPath = item.setPath;
  return turn;
};

const asCards = (value: unknown): AssistantCard[] => {
  if (!Array.isArray(value)) return [];
  const cards: AssistantCard[] = [];
  for (const item of value) {
    const card = asCard(item);
    if (card) cards.push(card);
  }
  return cards;
};

const asCard = (value: unknown): AssistantCard | null => {
  if (!value || typeof value !== "object") return null;
  const item = value as { id?: unknown; name?: unknown; price?: unknown; image?: unknown; href?: unknown };
  if (typeof item.id !== "number" || typeof item.name !== "string" || typeof item.href !== "string") return null;
  return {
    id: item.id,
    name: item.name,
    price: typeof item.price === "number" ? item.price : null,
    image: typeof item.image === "string" ? item.image : null,
    href: item.href,
  };
};
