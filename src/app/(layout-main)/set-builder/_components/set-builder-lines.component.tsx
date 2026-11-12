"use client";

import { CdnImage } from "@/components";
import { ButtonComponent } from "@/components/button/button.component";
import { useProductDefaultImage } from "@/components/providers.component";
import type { SetBuilderLine } from "@/utils/api/ai/set-builder.validation";
import { formatPrice } from "@/utils/constants/common.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { Box, Stack, Typography } from "@mui/material";

type SetBuilderLinesProps = {
  lines: SetBuilderLine[];
  onConfirm: (productId: number) => void;
  onRemove: (productId: number) => void;
  onReplace: (productId: number) => void;
  onOpenDetail: (line: SetBuilderLine) => void;
};

const stockLabel = (stock: number | null) => {
  if (stock == null) return "Chưa rõ tồn kho";
  if (stock <= 0) return "Hết hàng";
  return `Còn ${stock}`;
};

const SetBuilderLineCard = ({
  line,
  onConfirm,
  onRemove,
  onReplace,
  onOpenDetail,
}: {
  line: SetBuilderLine;
  onConfirm: (productId: number) => void;
  onRemove: (productId: number) => void;
  onReplace: (productId: number) => void;
  onOpenDetail: (line: SetBuilderLine) => void;
}) => {
  const fallback = useProductDefaultImage();
  const canConfirm = line.skuId != null && (line.stock ?? 0) > 0 && !line.confirmedSku;
  return (
    <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: "16px", border: "1px solid #E5E5E5", p: "12px" }}>
      <Box sx={{ position: "relative", width: { xs: "100%", sm: 140 }, height: 140, flexShrink: 0 }}>
        <CdnImage as="next" src={line.thumbnailUrl || fallback} alt={line.productName} fill sizes="140px" style={{ objectFit: "cover" }} />
      </Box>
      <Stack sx={{ gap: "6px", flex: 1 }}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semiBold }}>{line.productName}</Typography>
        {line.isKeyPiece ? <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium }}>Món chính</Typography> : null}
        <Typography>{line.skuCode ? `SKU ${line.skuCode}` : "Chưa có SKU"}</Typography>
        <Typography>{line.price == null ? "Chưa có giá" : formatPrice(line.price)}</Typography>
        <Typography>{stockLabel(line.stock)}</Typography>
        <Typography>{line.confirmedSku ? "Đã xác nhận SKU" : "Chưa xác nhận SKU"}</Typography>
        <Stack direction="row" sx={{ gap: "8px", flexWrap: "wrap" }}>
          <ButtonComponent content="Xem chi tiết" variant="outlined" onClick={() => onOpenDetail(line)} />
          <ButtonComponent content="Xác nhận SKU" disabled={!canConfirm} onClick={() => onConfirm(line.productId)} />
          <ButtonComponent content="Thay" variant="outlined" onClick={() => onReplace(line.productId)} />
          <ButtonComponent content="Bỏ" variant="outlined" onClick={() => onRemove(line.productId)} />
        </Stack>
      </Stack>
    </Stack>
  );
};

const SetBuilderLines = ({ lines, onConfirm, onRemove, onReplace, onOpenDetail }: SetBuilderLinesProps) => (
  <Stack sx={{ gap: "12px" }}>
    {lines.map((line) => (
      <SetBuilderLineCard key={line.productId} line={line} onConfirm={onConfirm} onRemove={onRemove} onReplace={onReplace} onOpenDetail={onOpenDetail} />
    ))}
  </Stack>
);

export default SetBuilderLines;
