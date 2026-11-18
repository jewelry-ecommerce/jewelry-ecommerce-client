import { askAssistant } from "@/components/ai-assistant/assistant-ask";
import {
  assistantModelHistory,
  readAssistantTranscript,
  withoutLeadingGreeting,
  writeAssistantTranscript,
  type AssistantTranscriptTurn,
} from "@/components/ai-assistant/assistant-transcript.storage";
import { useEffect, useRef, useState } from "react";

const greeting: AssistantTranscriptTurn = {
  role: "assistant",
  text: "Xin chào, cảm ơn bạn đã ghé shop. Bạn cần tư vấn món nào ạ?",
};

export const useAssistantConversation = () => {
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [turns, setTurns] = useState<AssistantTranscriptTurn[]>([greeting]);
  const hydrated = useRef(false);

  useEffect(() => {
    const stored = readAssistantTranscript();
    if (stored.length > 0) setTurns([greeting, ...stored]);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    writeAssistantTranscript(withoutLeadingGreeting(turns, greeting.text));
  }, [ready, turns]);

  const send = async (text: string) => {
    const history = assistantModelHistory(withoutLeadingGreeting(turns, greeting.text));
    setTurns((current) => [...current, { role: "user", text }]);
    setBusy(true);
    const answer = await askAssistant(text, history);
    setTurns((current) => [...current, assistantTurn(answer.text, answer.cards, answer.setPath)]);
    setBusy(false);
  };

  return { turns, busy, send };
};

const assistantTurn = (
  text: string,
  cards: AssistantTranscriptTurn["cards"],
  setPath?: string,
): AssistantTranscriptTurn => {
  const turn: AssistantTranscriptTurn = { role: "assistant", text };
  if (cards && cards.length > 0) turn.cards = cards;
  if (setPath) turn.setPath = setPath;
  return turn;
};
