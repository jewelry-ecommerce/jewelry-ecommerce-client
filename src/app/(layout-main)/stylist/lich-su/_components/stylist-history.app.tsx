"use client";

import AiPageFrame from "@/components/ai/ai-page-frame.component";
import AiSourceBanner from "@/components/ai/ai-source-banner.component";
import { ButtonComponent } from "@/components/button/button.component";
import { useAppSelector } from "@/redux/hooks";
import { selectIsAuthResolved, selectIsLogin } from "@/redux/slices/auth.slice";
import { AiApi } from "@/utils/api";
import type { AiStylistSession } from "@/utils/api/ai/ai.interface";
import { formatMatchScore } from "@/utils/api/ai/ai.mapper";
import { formatPrice } from "@/utils/constants/common.constant";
import { buildAuthUrl } from "@/utils/helpers/common/navigation";
import { getErrorMessage } from "@/utils/helpers/axios";
import { Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const formatSessionDate = (value: string | number | null) => {
  if (value == null) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

const SessionCard = ({ session }: { session: AiStylistSession }) => (
  <Stack sx={{ border: "1px solid #E5E5E5", p: "16px", gap: "8px" }}>
    <Typography>{session.occasion || "Gợi ý"} · {formatSessionDate(session.createdDate)}</Typography>
    <AiSourceBanner source={session.source} />
    <Typography>{session.budget == null ? "Chưa chọn ngân sách" : `Ngân sách ${formatPrice(session.budget)}`}</Typography>
    <Typography>{session.items.length} món</Typography>
    {session.items.map((item) => (
      <Typography key={`${session.id}-${item.productId}`}>
        Sản phẩm {item.productId} · Điểm phù hợp {formatMatchScore(item.matchScore)}
      </Typography>
    ))}
  </Stack>
);

const StylistHistoryApp = () => {
  const router = useRouter();
  const isLogin = useAppSelector(selectIsLogin);
  const isAuthResolved = useAppSelector(selectIsAuthResolved);
  const [sessions, setSessions] = useState<AiStylistSession[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isAuthResolved) return;
    if (!isLogin) router.replace(buildAuthUrl("/dang-nhap"));
  }, [isAuthResolved, isLogin, router]);

  useEffect(() => {
    if (!isAuthResolved || !isLogin) return;
    let active = true;
    void AiApi.getStylistSessions()
      .then((next) => { if (active) { setSessions(next); setStatus("ready"); } })
      .catch((error: unknown) => { if (active) { setStatus("error"); setErrorMessage(getErrorMessage(error) || "Không tải được lịch sử."); } });
    return () => { active = false; };
  }, [isAuthResolved, isLogin]);

  return (
    <AiPageFrame currentLabel="Lịch sử gợi ý" title="Lịch sử gợi ý" parent={{ label: "Gợi ý trang sức", href: "/stylist" }}>
      {!isAuthResolved || !isLogin ? <Typography>Đang chuyển tới đăng nhập...</Typography> : null}
      {isLogin && status === "loading" ? <Typography>Đang tải lịch sử...</Typography> : null}
      {isLogin && status === "error" ? (
        <Stack sx={{ gap: "12px" }}>
          <Typography color="error">{errorMessage}</Typography>
          <ButtonComponent content="Thử lại" onClick={() => window.location.reload()} />
        </Stack>
      ) : null}
      {isLogin && status === "ready" && sessions.length === 0 ? <Typography>Bạn chưa có phiên gợi ý nào.</Typography> : null}
      {isLogin && status === "ready" ? sessions.map((session) => <SessionCard key={session.id} session={session} />) : null}
    </AiPageFrame>
  );
};

export default StylistHistoryApp;
