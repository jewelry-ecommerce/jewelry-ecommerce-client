"use client";

import AiPageFrame from "@/components/ai/ai-page-frame.component";
import AiPreferenceForm from "@/components/ai/ai-preference-form.component";
import { ButtonComponent } from "@/components/button/button.component";
import { useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import { AiApi } from "@/utils/api";
import { AI_BUDGET_SCOPE_ITEM } from "@/utils/api/ai/ai.constant";
import type { AiPreferenceValues, AiRecommendation, AiStylistResponse } from "@/utils/api/ai/ai.interface";
import { toStylistRequest } from "@/utils/api/ai/ai.mapper";
import { getErrorMessage } from "@/utils/helpers/axios";
import { Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import StylistResults from "./stylist-results.component";

type StylistStatus = "idle" | "loading" | "ready" | "empty" | "error";

const applyRecommendations = (response: AiStylistResponse) =>
  response.recommendations.length > 0 ? "ready" as const : "empty" as const;

const StylistApp = () => {
  const router = useRouter();
  const isLogin = useAppSelector(selectIsLogin);
  const submitLock = useRef(false);
  const [status, setStatus] = useState<StylistStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<AiStylistResponse | null>(null);
  const [prefs, setPrefs] = useState<AiPreferenceValues | null>(null);
  const [openingId, setOpeningId] = useState<number | null>(null);

  const run = async (values: AiPreferenceValues) => {
    if (submitLock.current) return;
    submitLock.current = true;
    setStatus("loading");
    setErrorMessage("");
    setPrefs(values);
    try {
      const response = await AiApi.recommendStylist(toStylistRequest(values, AI_BUDGET_SCOPE_ITEM));
      setResult(response);
      setStatus(applyRecommendations(response));
    } catch (error) {
      setStatus("error");
      setErrorMessage(getErrorMessage(error) || "Không tạo được gợi ý. Vui lòng thử lại.");
    } finally {
      submitLock.current = false;
    }
  };

  const openDetail = async (item: AiRecommendation) => {
    if (openingId != null) return;
    setOpeningId(item.id);
    const href = await AiApi.resolveProductDetailPath(item.id, item.name, item.slug);
    router.push(href);
  };

  return (
    <AiPageFrame currentLabel="Gợi ý trang sức" title="Gợi ý trang sức">
      <AiPreferenceForm submitLabel="Xem gợi ý" submitting={status === "loading"} onSubmit={(values) => void run(values)} />
      {status === "loading" ? <Typography>Đang tìm gợi ý...</Typography> : null}
      {status === "empty" ? <Typography>Chưa có sản phẩm phù hợp. Hãy đổi dịp hoặc ngân sách rồi thử lại.</Typography> : null}
      {status === "error" ? (
        <Stack sx={{ gap: "12px" }}>
          <Typography color="error">{errorMessage}</Typography>
          <ButtonComponent content="Thử lại" disabled={!prefs} onClick={() => prefs && void run(prefs)} />
        </Stack>
      ) : null}
      {status === "ready" && result ? (
        <StylistResults
          result={result}
          canFeedback={isLogin}
          onOpenDetail={(item) => void openDetail(item)}
        />
      ) : null}
    </AiPageFrame>
  );
};

export default StylistApp;
