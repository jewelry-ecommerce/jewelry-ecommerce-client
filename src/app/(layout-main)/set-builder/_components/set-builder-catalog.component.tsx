"use client";

import { TextFieldComponent } from "@/components";
import { ButtonComponent } from "@/components/button/button.component";
import { AiApi } from "@/utils/api";
import type { CatalogPick } from "@/utils/api/ai/ai.interface";
import { formatPrice } from "@/utils/constants/common.constant";
import { getErrorMessage } from "@/utils/helpers/axios";
import { Stack, Typography } from "@mui/material";
import { useState } from "react";

type SetBuilderCatalogProps = {
  onPick: (pick: CatalogPick) => void;
};

const SetBuilderCatalog = ({ onPick }: SetBuilderCatalogProps) => {
  const [keyword, setKeyword] = useState("");
  const [hits, setHits] = useState<CatalogPick[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const search = async () => {
    const term = keyword.trim();
    if (!term || loading) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const next = await AiApi.searchCatalogForSet(term);
      setHits(next);
      if (next.length === 0) setErrorMessage("Không thấy sản phẩm phù hợp.");
    } catch (error) {
      setHits([]);
      setErrorMessage(getErrorMessage(error) || "Không tìm được sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack sx={{ gap: "12px" }}>
      <Typography>Thêm hoặc thay từ catalog</Typography>
      <TextFieldComponent label="Tên sản phẩm" value={keyword} onValueChange={setKeyword} />
      <ButtonComponent content="Tìm sản phẩm" loading={loading} disabled={loading} onClick={() => void search()} />
      {errorMessage ? <Typography>{errorMessage}</Typography> : null}
      {hits.map((hit) => (
        <Stack key={hit.productId} direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", gap: "8px" }}>
          <Typography>{hit.name} · {hit.price == null ? "Chưa có giá" : formatPrice(hit.price)}</Typography>
          <ButtonComponent content="Chọn" onClick={() => onPick(hit)} />
        </Stack>
      ))}
    </Stack>
  );
};

export default SetBuilderCatalog;
