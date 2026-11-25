"use client";

import { CdnImage } from "@/components";
import { useProductDefaultImage } from "@/components/providers.component";
import type { AssistantCard } from "@/components/ai-assistant/assistant-ask";
import type { AssistantTranscriptTurn } from "@/components/ai-assistant/assistant-transcript.storage";
import { useAssistantConversation } from "@/components/ai-assistant/use-assistant-conversation";
import { formatPrice } from "@/utils/constants/common.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { Box, Stack, Typography } from "@mui/material";
import type { ChangeEvent } from "react";
import { MessageChatCircle, Stars01, XClose } from "@untitledui/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Turn = AssistantTranscriptTurn;

const fabBase = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 999,
  textDecoration: "none",
  boxShadow: "0 6px 18px rgba(0,0,0,.16)",
  cursor: "pointer",
  border: 0,
} as const;

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

const AssistantPanel = ({
  turns,
  busy,
  onSend,
  onClose,
  offsetBottom,
}: {
  turns: Turn[];
  busy: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
  offsetBottom: number;
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
    <Stack sx={{ position: "fixed", right: 16, bottom: offsetBottom, zIndex: 1100, width: { xs: "calc(100vw - 32px)", sm: 360 }, height: { xs: "min(480px, calc(100vh - 140px))", sm: 480 }, background: "#fff", border: "1px solid #E7E5E4", boxShadow: "0 12px 40px rgba(0,0,0,.16)" }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5, background: "#1B1F22", color: "#fff" }}>
        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Tư vấn mua hàng</Typography>
        <Box component="button" type="button" aria-label="Đóng khung tư vấn" onClick={onClose} sx={{ color: "#fff", background: "transparent", border: 0, cursor: "pointer" }}><XClose size={18} /></Box>
      </Stack>
      <MessageList turns={turns} busy={busy} />
      <Stack direction="row" component="form" onSubmit={(event) => { event.preventDefault(); submit(); }} sx={{ gap: 1, p: 1.5, borderTop: "1px solid #E7E5E4" }}>
        <Box component="input" ref={inputRef} value={draft} aria-label="Câu hỏi của bạn" placeholder="Nhập nội dung cần hỗ trợ" onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value)} sx={{ flex: 1, border: "1px solid #D6D3D1", px: 1, height: 40, fontSize: 14 }} />
        <Box component="button" type="submit" disabled={busy || draft.trim().length === 0} sx={{ px: 1.5, background: "#1B1F22", color: "#fff", border: 0, cursor: "pointer", fontSize: 13 }}>Gửi</Box>
      </Stack>
    </Stack>
  );
};

const AiAssistantWidget = () => {
  const [open, setOpen] = useState(false);
  const { turns, busy, send } = useAssistantConversation();
  const pathname = usePathname();
  const onTryOnPage = pathname?.startsWith("/stylist-try-on") ?? false;
  const panelBottom = onTryOnPage ? 72 : 120;

  return (
    <>
      {open ? (
        <AssistantPanel
          turns={turns}
          busy={busy}
          onSend={(text) => void send(text)}
          onClose={() => setOpen(false)}
          offsetBottom={panelBottom}
        />
      ) : null}
      <Stack
        direction="column"
        sx={{ position: "fixed", right: { xs: 12, sm: 16 }, bottom: { xs: 12, sm: 16 }, zIndex: 1100, gap: 1, alignItems: "flex-end" }}
      >
        {!onTryOnPage ? (
          <Box
            component={Link}
            href="/stylist-try-on"
            aria-label="Đeo thử trang sức"
            sx={{
              ...fabBase,
              gap: 0.75,
              background: "#fff",
              color: "#1B1F22",
              border: "1px solid #E5E5E5",
              height: 40,
              px: 1.5,
              ...TYPOGRAPHY_STYLES.sm.medium,
            }}
          >
            <Stars01 size={16} />
            Đeo thử
          </Box>
        ) : null}
        <Box
          component="button"
          type="button"
          aria-label="Mở khung tư vấn"
          onClick={() => setOpen((value) => !value)}
          sx={{
            ...fabBase,
            gap: 0.75,
            background: "#1B1F22",
            color: "#fff",
            height: 40,
            px: 1.5,
            ...TYPOGRAPHY_STYLES.sm.medium,
          }}
        >
          <MessageChatCircle size={16} />
          Tư vấn
        </Box>
      </Stack>
    </>
  );
};

export default AiAssistantWidget;
