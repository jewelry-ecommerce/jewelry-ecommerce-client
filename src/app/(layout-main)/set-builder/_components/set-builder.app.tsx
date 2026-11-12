"use client";

import AiPageFrame from "@/components/ai/ai-page-frame.component";
import AiPreferenceForm from "@/components/ai/ai-preference-form.component";
import AiSourceBanner from "@/components/ai/ai-source-banner.component";
import { AI_PREFERENCE_DEFAULTS } from "@/components/ai/ai-preference.schema";
import { ButtonComponent } from "@/components/button/button.component";
import { useAppDispatch } from "@/redux/hooks";
import { openCartDrawer, syncCartFromServer } from "@/redux/slices/cart.slice";
import { AiApi, CartApi } from "@/utils/api";
import { AI_BUDGET_OVER_MESSAGE, CART_BATCH_FAILED_CODE } from "@/utils/api/ai/ai.constant";
import type { AiPreferenceValues, AiSetBuilderResponse, CatalogPick } from "@/utils/api/ai/ai.interface";
import { readApiErrorCode, toSetBuilderRequest } from "@/utils/api/ai/ai.mapper";
import {
  appendSetLine,
  confirmSetLine,
  lineFromCatalogPick,
  lineFromSetItem,
  removeSetLine,
  replaceSetLine,
  setBuilderBlockMessage,
  setBuilderTotal,
  type SetBuilderLine,
} from "@/utils/api/ai/set-builder.validation";
import { buildStylistSetDraft, readStylistSetDraft, saveStylistSetDraft } from "@/utils/api/ai/stylist-draft";
import { formatPrice } from "@/utils/constants/common.constant";
import { getErrorMessage } from "@/utils/helpers/axios";
import { Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import SetBuilderCatalog from "./set-builder-catalog.component";
import SetBuilderLines from "./set-builder-lines.component";

type SetMeta = { source: string; banner?: string; name: string; description: string };

const metaFromResponse = (response: AiSetBuilderResponse): SetMeta => ({
  source: response.source,
  ...(response.banner ? { banner: response.banner } : {}),
  name: response.name,
  description: response.description,
});

const SetBuilderApp = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const requestLock = useRef(false);
  const addLock = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const [formKey, setFormKey] = useState("new");
  const [prefs, setPrefs] = useState<AiPreferenceValues>(AI_PREFERENCE_DEFAULTS);
  const [lines, setLines] = useState<SetBuilderLine[]>([]);
  const [meta, setMeta] = useState<SetMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [replacingId, setReplacingId] = useState<number | null>(null);

  useEffect(() => {
    const draft = readStylistSetDraft();
    if (draft) {
      setPrefs(draft.prefs);
      setLines(draft.lines);
      setFormKey("draft");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveStylistSetDraft(buildStylistSetDraft(prefs, lines));
  }, [hydrated, prefs, lines]);

  const requestSet = async (values: AiPreferenceValues) => {
    if (requestLock.current) return;
    requestLock.current = true;
    setLoading(true);
    setErrorMessage("");
    setPrefs(values);
    try {
      const response = await AiApi.buildJewelrySet(toSetBuilderRequest(values));
      setLines(response.items.map(lineFromSetItem));
      setMeta(metaFromResponse(response));
      if (response.items.length === 0) setErrorMessage("Chưa đủ sản phẩm để tạo bộ. Hãy đổi nhu cầu.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error) || "Không tạo được bộ. Vui lòng thử lại.");
    } finally {
      requestLock.current = false;
      setLoading(false);
    }
  };

  const applyPick = (pick: CatalogPick) => {
    const next = lineFromCatalogPick(pick);
    const change = replacingId == null ? appendSetLine(lines, next) : replaceSetLine(lines, replacingId, next);
    if (!change.ok) {
      toast.error(change.message);
      return;
    }
    setLines(change.lines);
    setReplacingId(null);
  };

  const addAll = async () => {
    const blocked = setBuilderBlockMessage(lines, prefs.budget);
    if (blocked) {
      setErrorMessage(blocked);
      return;
    }
    if (addLock.current) return;
    addLock.current = true;
    setAdding(true);
    setErrorMessage("");
    try {
      const response = await CartApi.batchAddToCart(lines.flatMap((line) => (
        line.skuId == null ? [] : [{ variationId: String(line.skuId), quantity: 1 }]
      )));
      if (!response.success) {
        toast.error(response.message || "Không thêm được cả bộ vào giỏ.");
        return;
      }
      await dispatch(syncCartFromServer());
      toast.success("Đã thêm cả bộ vào giỏ.");
      dispatch(openCartDrawer());
    } catch (error) {
      const fallback = readApiErrorCode(error) === CART_BATCH_FAILED_CODE
        ? "Không thêm được cả bộ. Lựa chọn vẫn giữ nguyên, hãy kiểm tra tồn kho."
        : "Không thêm được cả bộ vào giỏ.";
      toast.error(getErrorMessage(error) || fallback);
    } finally {
      addLock.current = false;
      setAdding(false);
    }
  };

  const openDetail = async (line: SetBuilderLine) => {
    router.push(await AiApi.resolveProductDetailPath(line.productId, line.productName, line.slug));
  };

  const total = setBuilderTotal(lines);

  return (
    <AiPageFrame currentLabel="Tạo bộ trang sức" title="Tạo bộ trang sức">
      <AiPreferenceForm key={formKey} initialValues={prefs} submitLabel="Gợi ý bộ" submitting={loading} onSubmit={(values) => void requestSet(values)} />
      {loading ? <Typography>Đang phối bộ...</Typography> : null}
      {errorMessage ? <Typography color="error">{errorMessage}</Typography> : null}
      {meta ? (
        <Stack sx={{ gap: "8px" }}>
          <Typography>{meta.name}</Typography>
          <Typography>{meta.description}</Typography>
          <AiSourceBanner source={meta.source} banner={meta.banner} />
        </Stack>
      ) : null}
      {lines.length === 0 ? <Typography>Chọn nhu cầu để gợi ý bộ, hoặc thêm sản phẩm từ catalog. Bộ gồm 2–6 món.</Typography> : null}
      <SetBuilderLines
        lines={lines}
        onConfirm={(productId) => setLines((current) => confirmSetLine(current, productId))}
        onRemove={(productId) => setLines((current) => removeSetLine(current, productId))}
        onReplace={setReplacingId}
        onOpenDetail={(line) => void openDetail(line)}
      />
      {replacingId != null ? <Typography>Đang thay sản phẩm {replacingId}. Chọn một món trong catalog.</Typography> : null}
      <SetBuilderCatalog onPick={applyPick} />
      <Typography>Tổng bộ: {formatPrice(total)}</Typography>
      {total > prefs.budget ? <Typography color="error">{AI_BUDGET_OVER_MESSAGE}</Typography> : null}
      <ButtonComponent content="Thêm cả bộ vào giỏ" loading={adding} disabled={adding || lines.length === 0} onClick={() => void addAll()} />
    </AiPageFrame>
  );
};

export default SetBuilderApp;
