"use client";

import { CdnImage } from "@/components";
import { ButtonComponent } from "@/components/button/button.component";
import { useProductDefaultImage } from "@/components/providers.component";
import useAddToCart from "@/hooks/cart/use-add-to-cart.hook";
import { AiApi } from "@/utils/api";
import type { AiRecommendation } from "@/utils/api/ai/ai.interface";
import { formatMatchScore } from "@/utils/api/ai/ai.mapper";
import type { CartViewItem } from "@/utils/api/cart/cart.interface";
import { formatPrice } from "@/utils/constants/common.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { getErrorMessage } from "@/utils/helpers/axios";
import { Box, Checkbox, Stack, Typography } from "@mui/material";
import { ThumbsDown, ThumbsUp } from "@untitledui/icons";
import { useState } from "react";
import { toast } from "react-toastify";

type StylistCardProps = {
  item: AiRecommendation;
  selected: boolean;
  sessionId?: number;
  canFeedback: boolean;
  onToggle: (productId: number) => void;
  onOpenDetail: (item: AiRecommendation) => void;
};

const cartItem = (item: AiRecommendation, variationId: string): CartViewItem => ({
  id: variationId,
  variationId,
  productId: String(item.id),
  productSlug: item.slug ?? "",
  name: item.name,
  image: { src: item.thumbnailUrl ?? "", alt: item.name },
  quantity: 1,
  unitPrice: item.price ?? 0,
  price: { current: item.price == null ? "" : formatPrice(item.price) },
});

const StylistFeedback = ({ sessionId, productId }: { sessionId: number; productId: number }) => {
  const [pending, setPending] = useState(false);
  const send = async (liked: boolean) => {
    if (pending) return;
    setPending(true);
    try {
      await AiApi.sendStylistFeedback({ sessionId, productId, liked });
      toast.success(liked ? "Đã ghi nhận lượt thích." : "Đã ghi nhận lượt không thích.");
    } catch (error) {
      toast.error(getErrorMessage(error) || "Không gửi được đánh giá.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Stack direction="row" sx={{ gap: "8px" }}>
      <Box component="button" type="button" aria-label="Thích gợi ý" disabled={pending} onClick={() => void send(true)}><ThumbsUp size={18} /></Box>
      <Box component="button" type="button" aria-label="Không thích gợi ý" disabled={pending} onClick={() => void send(false)}><ThumbsDown size={18} /></Box>
    </Stack>
  );
};

const StylistCard = ({ item, selected, sessionId, canFeedback, onToggle, onOpenDetail }: StylistCardProps) => {
  const fallback = useProductDefaultImage();
  const { handleAddToCart } = useAddToCart({ openCartDrawerOnSuccess: true });
  const canBuy = item.skuId != null && (item.stock ?? 0) > 0;
  const add = () => {
    if (!canBuy || item.skuId == null) return;
    void handleAddToCart(String(item.skuId), 1, cartItem(item, String(item.skuId)));
  };

  return (
    <Stack sx={{ border: "1px solid #E5E5E5", gap: "12px", p: "12px", height: "100%" }}>
      <Box sx={{ position: "relative", aspectRatio: "1 / 1" }}>
        <CdnImage as="next" src={item.thumbnailUrl || fallback} alt={item.name} fill sizes="(max-width: 600px) 100vw, 320px" style={{ objectFit: "cover" }} />
      </Box>
      <Stack direction="row" sx={{ alignItems: "flex-start", gap: "8px" }}>
        <Checkbox checked={selected} onChange={() => onToggle(item.id)} inputProps={{ "aria-label": `Chọn ${item.name}` }} />
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semiBold }}>{item.name}</Typography>
      </Stack>
      <Typography>{item.price == null ? "Chưa có giá" : formatPrice(item.price)}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#525252" }}>{item.reason}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium }}>Điểm phù hợp {formatMatchScore(item.matchScore)}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular }}>{(item.stock ?? 0) > 0 ? `Còn ${item.stock}` : "Hết hàng"}</Typography>
      {canFeedback && sessionId != null ? <StylistFeedback sessionId={sessionId} productId={item.id} /> : null}
      <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: "8px", mt: "auto" }}>
        <ButtonComponent content="Xem chi tiết" variant="outlined" onClick={() => onOpenDetail(item)} />
        <ButtonComponent content={canBuy ? "Thêm vào giỏ" : "Hết hàng"} disabled={!canBuy} onClick={add} />
      </Stack>
    </Stack>
  );
};

export default StylistCard;
