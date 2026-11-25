"use client";

import AiPageFrame from "@/components/ai/ai-page-frame.component";
import { CdnImage, TextFieldComponent } from "@/components";
import { ButtonComponent } from "@/components/button/button.component";
import { useProductDefaultImage } from "@/components/providers.component";
import { AiApi } from "@/utils/api";
import type { AiTryOnResponse, AiTryOnVariant } from "@/utils/api/ai/ai.interface";
import { formatPrice } from "@/utils/constants/common.constant";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { getErrorMessage } from "@/utils/helpers/axios";
import { Box, Stack, Typography } from "@mui/material";
import { Image01 } from "@untitledui/icons";
import Link from "next/link";
import type { ChangeEvent } from "react";
import { useRef, useState } from "react";

type Status = "idle" | "loading" | "ready" | "rejected" | "error";

const ACCEPT = "image/jpeg,image/png";
const MAX_BYTES = 5 * 1024 * 1024;

const STEPS = [
  { step: "01", title: "Tải ảnh vùng đeo", detail: "Cổ tay, cổ chân, cổ, tai hoặc bàn tay — ảnh rõ, đủ sáng." },
  { step: "02", title: "AI chọn mẫu phù hợp", detail: "Nhận diện vùng đeo rồi lấy 2–3 món từ catalog đang bán." },
  { step: "03", title: "Xem thử & mua", detail: "Ảnh minh họa lookalike kèm link sản phẩm thật trên web." },
];

const REGIONS = [
  { label: "Nhẫn", hint: "Ngón tay / bàn tay" },
  { label: "Lắc", hint: "Cổ tay / cổ chân" },
  { label: "Dây chuyền", hint: "Cổ / ngực" },
  { label: "Bông tai", hint: "Tai" },
];

const VariantCard = ({ item }: { item: AiTryOnVariant }) => {
  const fallback = useProductDefaultImage();
  const href = item.productSlug
    ? `/san-pham/${item.productSlug}`
    : `/tim-kiem?query=${encodeURIComponent(item.productName)}`;
  return (
    <Stack sx={{ border: "1px solid #E5E5E5", gap: "12px", p: "12px", height: "100%", background: "#fff" }}>
      <Box sx={{ position: "relative", aspectRatio: "1 / 1", background: "#F5F5F5" }}>
        <CdnImage
          as="next"
          src={item.tryOnImageUrl || item.productThumbnailUrl || fallback}
          alt={item.productName}
          fill
          sizes="(max-width: 600px) 100vw, 320px"
          style={{ objectFit: "cover" }}
        />
      </Box>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: "#525252" }}>{item.styleLabel}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semiBold }}>{item.productName}</Typography>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular }}>
        {item.price == null ? "Chưa có giá" : formatPrice(item.price)}
      </Typography>
      <ButtonComponent component={Link} href={href} variant="outlined" content="Xem sản phẩm" sx={{ mt: "auto" }} />
    </Stack>
  );
};

const UploadZone = ({ preview, onOpen }: { preview: string | null; onOpen: () => void }) => (
  <Box
    component="button"
    type="button"
    onClick={onOpen}
    sx={{
      border: "1px solid #E5E5E5",
      background: preview ? "#fff" : "#FAFAFA",
      width: "100%",
      minHeight: { xs: 200, md: 280 },
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      px: 2,
      py: 3,
      "&:hover": { borderColor: "#A3A3A3", background: preview ? "#fff" : "#F5F5F5" },
    }}
  >
    {preview ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={preview}
        alt="Ảnh đã chọn"
        style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
      />
    ) : (
      <>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#fff",
            border: "1px solid #E5E5E5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image01 size={24} color="#525252" />
        </Box>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.md.medium, color: "#27251F" }}>Chọn ảnh để đeo thử</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#737373", textAlign: "center", maxWidth: 320 }}>
          JPEG / PNG · tối đa 5MB
        </Typography>
      </>
    )}
  </Box>
);

const GuidePanel = () => (
  <Stack sx={{ gap: "20px", height: "100%" }}>
    <Stack sx={{ border: "1px solid #E5E5E5", background: "#FAFAFA", p: { xs: "16px", md: "20px" }, gap: "16px" }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semiBold, color: "#27251F", textTransform: "uppercase" }}>
        Cách dùng
      </Typography>
      {STEPS.map((item) => (
        <Stack key={item.step} direction="row" sx={{ gap: "12px", alignItems: "flex-start" }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semiBold, color: "#A3A3A3", minWidth: 28 }}>{item.step}</Typography>
          <Stack sx={{ gap: "2px" }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium, color: "#27251F" }}>{item.title}</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#737373" }}>{item.detail}</Typography>
          </Stack>
        </Stack>
      ))}
    </Stack>

    <Stack sx={{ border: "1px solid #E5E5E5", p: { xs: "16px", md: "20px" }, gap: "12px" }}>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semiBold, color: "#27251F", textTransform: "uppercase" }}>
        Vùng ảnh phù hợp
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {REGIONS.map((region) => (
          <Stack key={region.label} sx={{ border: "1px solid #E5E5E5", p: "12px", gap: "4px", background: "#fff" }}>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.base.medium }}>{region.label}</Typography>
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#737373" }}>{region.hint}</Typography>
          </Stack>
        ))}
      </Box>
      <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#737373" }}>
        Ảnh minh họa AI (lookalike). Sản phẩm mua là đúng hàng trên web, không cam kết giống pixel 100%.
      </Typography>
    </Stack>
  </Stack>
);

const StylistTryOnApp = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [styleHint, setStyleHint] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AiTryOnResponse | null>(null);

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!next) return;
    if (!ACCEPT.split(",").includes(next.type)) {
      setStatus("error");
      setMessage("Chỉ hỗ trợ ảnh jpeg hoặc png");
      return;
    }
    if (next.size > MAX_BYTES) {
      setStatus("error");
      setMessage("Ảnh vượt quá 5MB");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(URL.createObjectURL(next));
    setResult(null);
    setStatus("idle");
    setMessage("");
  };

  const run = async () => {
    if (!file || status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const response = await AiApi.tryOnStylist(file, styleHint);
      setResult(response);
      if (!response.ok || response.variants.length === 0) {
        setStatus("rejected");
        setMessage(response.message || "Không tạo được mẫu đeo thử từ ảnh này");
        return;
      }
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(getErrorMessage(error) || "Không gọi được AI đeo thử");
    }
  };

  return (
    <AiPageFrame currentLabel="Đeo thử" title="Đeo thử trang sức">
      <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: "#525252", maxWidth: 720 }}>
        Chụp hoặc tải ảnh vùng đeo — AI gợi ý vài mẫu gần giống từ catalog để bạn xem thử trước khi mua.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.15fr) minmax(0, 0.85fr)" },
          gap: { xs: "24px", md: "28px" },
          alignItems: "start",
        }}
      >
        <Stack sx={{ gap: "16px", border: "1px solid #E5E5E5", p: { xs: "16px", md: "20px" }, background: "#fff" }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semiBold, textTransform: "uppercase" }}>Ảnh của bạn</Typography>
          <UploadZone preview={preview} onOpen={() => inputRef.current?.click()} />
          <Box component="input" ref={inputRef} type="file" accept={ACCEPT} onChange={onPick} sx={{ display: "none" }} />
          {preview ? (
            <ButtonComponent
              content="Đổi ảnh"
              variant="outlined"
              onClick={() => inputRef.current?.click()}
              sx={{ alignSelf: "flex-start" }}
            />
          ) : null}
          <TextFieldComponent
            label="Phong cách mong muốn"
            value={styleHint}
            onValueChange={setStyleHint}
          />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#737373", mt: "-8px" }}>
            Tuỳ chọn · ví dụ: tối giản, nổi bật, hàng ngày
          </Typography>
          <ButtonComponent
            variant="contained"
            disabled={!file || status === "loading"}
            loading={status === "loading"}
            onClick={() => void run()}
            content={status === "loading" ? "Đang tạo mẫu..." : "Xem mẫu đeo thử"}
          />
          {(status === "error" || status === "rejected") && message ? (
            <Typography color="error" sx={{ ...TYPOGRAPHY_STYLES.base.regular }}>{message}</Typography>
          ) : null}
        </Stack>

        <GuidePanel />
      </Box>

      {status === "loading" ? (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: "#525252" }}>
          Đang nhận diện vùng đeo và tạo mẫu minh họa...
        </Typography>
      ) : null}

      {status === "ready" && result ? (
        <Stack sx={{ gap: "16px" }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#737373" }}>
            {result.disclaimer || "Ảnh minh họa AI; sản phẩm mua là đúng hàng trên web."}
          </Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semiBold }}>{result.variants.length} mẫu gợi ý</Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
              gap: "16px",
            }}
          >
            {result.variants.map((item) => (
              <VariantCard key={`${item.productId}-${item.style}`} item={item} />
            ))}
          </Box>
        </Stack>
      ) : null}
    </AiPageFrame>
  );
};

export default StylistTryOnApp;
