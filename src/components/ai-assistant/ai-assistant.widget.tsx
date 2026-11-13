"use client";

import { CdnImage } from "@/components";
import { useProductDefaultImage } from "@/components/providers.component";
import { askAssistant, type AssistantCard } from "@/components/ai-assistant/assistant-ask";
import { formatPrice } from "@/utils/constants/common.constant";
import { Box, Stack, Typography } from "@mui/material";
import type { ChangeEvent } from "react";
import { MessageChatCircle, XClose } from "@untitledui/icons";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Turn = { role: "user" | "assistant"; text: string; cards?: AssistantCard[]; setPath?: string };

const greeting: Turn = {
  role: "assistant",
  text: "Xin chào, cảm ơn bạn đã ghé shop. Bạn cần tư vấn món nào ạ?",
};

const AssistantCards = ({ cards }: { cards: AssistantCard[] }) => {
  const fallback = useProductDefaultImage();
  return (
    <Stack sx={{ gap: "8px" }}>
      {cards.map((card) => (
        <Link key={card.id} href={card.href} style={{ display: "flex", gap: 8, color: "inherit", textDecoration: "none" }}>
          <Box sx={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
            <CdnImage as="next" src={card.image || fallback} alt={card.name} fill sizes="56px" style={{ objectFit: "cover" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{card.name}</Typography>
            <Typography sx={{ fontSize: 12 }}>{card.price == null ? "Chưa có giá" : formatPrice(card.price)}</Typography>
          </Box>
        </Link>
      ))}
    </Stack>
  );
};

const TurnBubble = ({ turn }: { turn: Turn }) => (
  <Box sx={{ alignSelf: turn.role === "user" ? "flex-end" : "flex-start", maxWidth: "90%", background: turn.role === "user" ? "#1B1F22" : "#F6F5F4", color: turn.role === "user" ? "#fff" : "#27251F", px: 1.5, py: 1 }}>
    <Typography sx={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{turn.text}</Typography>
    {turn.cards && turn.cards.length > 0 ? <AssistantCards cards={turn.cards} /> : null}
    {turn.setPath ? <Link href={turn.setPath}>Xem các món để thêm vào giỏ</Link> : null}
  </Box>
);

const MessageList = ({ turns, busy }: { turns: Turn[]; busy: boolean }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [turns, busy]);
  return (
    <Stack sx={{ flex: 1, overflow: "auto", gap: "12px", p: 2 }}>
      {turns.map((turn, index) => <TurnBubble key={`${turn.role}-${index}`} turn={turn} />)}
      {busy ? <Typography sx={{ fontSize: 13, color: "#78716C" }}>Shop đang xem sản phẩm...</Typography> : null}
      <Box ref={bottomRef} />
    </Stack>
  );
};

const AssistantPanel = ({ turns, busy, onSend, onClose }: {
  turns: Turn[];
  busy: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
}) => {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const submit = () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    onSend(text);
  };
  return (
    <Stack sx={{ position: "fixed", right: 16, bottom: 84, zIndex: 1100, width: { xs: "calc(100vw - 32px)", sm: 360 }, height: { xs: "min(480px, calc(100vh - 120px))", sm: 480 }, background: "#fff", border: "1px solid #E7E5E4", boxShadow: "0 12px 40px rgba(0,0,0,.16)" }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, background: "#1B1F22", color: "#fff" }}>
        <Typography sx={{ fontWeight: 600 }}>Tư vấn mua hàng</Typography>
        <Box component="button" type="button" aria-label="Đóng khung tư vấn" onClick={onClose} sx={{ color: "#fff", background: "transparent", border: 0, cursor: "pointer" }}><XClose size={18} /></Box>
      </Stack>
      <MessageList turns={turns} busy={busy} />
      <Stack direction="row" component="form" onSubmit={(event) => { event.preventDefault(); submit(); }} sx={{ gap: 1, p: 1.5, borderTop: "1px solid #E7E5E4" }}>
        <Box component="input" ref={inputRef} value={draft} aria-label="Câu hỏi của bạn" placeholder="Nhập nội dung cần hỗ trợ" onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value)} sx={{ flex: 1, border: "1px solid #D6D3D1", px: 1, height: 40 }} />
        <Box component="button" type="submit" disabled={busy || draft.trim().length === 0} sx={{ px: 1.5, background: "#1B1F22", color: "#fff", border: 0, cursor: "pointer" }}>Gửi</Box>
      </Stack>
    </Stack>
  );
};

const AiAssistantWidget = () => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([greeting]);
  const send = async (text: string) => {
    setTurns((current) => [...current, { role: "user", text }]);
    setBusy(true);
    const answer = await askAssistant(text);
    setTurns((current) => [...current, { role: "assistant", text: answer.text, cards: answer.cards, setPath: answer.setPath }]);
    setBusy(false);
  };
  return (
    <>
      {open ? <AssistantPanel turns={turns} busy={busy} onSend={(text) => void send(text)} onClose={() => setOpen(false)} /> : null}
      <Box component="button" type="button" aria-label="Mở khung tư vấn" onClick={() => setOpen((value) => !value)} sx={{ position: "fixed", right: 16, bottom: 16, zIndex: 1100, display: "flex", alignItems: "center", gap: 1, border: 0, borderRadius: 999, background: "#1B1F22", color: "#fff", px: 2, height: 48, boxShadow: "0 8px 24px rgba(0,0,0,.2)", cursor: "pointer" }}>
        <MessageChatCircle size={18} />
        Tư vấn
      </Box>
    </>
  );
};

export default AiAssistantWidget;
