"use client";

import { StackAlignCenter, StackRowAlignCenter, StackRowAlignJustCenter } from "@/components/styled";
import ErrorShellLayout from "@/layouts/error-shell/error-shell.layout";
import { Box, Button, Typography } from "@mui/material";
import Image from "next/image";
import { gotoBack } from "@/utils/helpers/common/navigation";
import { useRouter } from "next/navigation";
import React from "react";

export type ErrorPageVariant = "404" | "500";

type ErrorPageProps = {
  variant: ErrorPageVariant;
  onPrimaryAction?: () => void;
};

const COPY: Record<
  ErrorPageVariant,
  {
    imageSrc: string;
    imageAlt: string;
    tagline: string;
    title: string;
    description: string;
    primaryLabel: string;
    hint: string;
  }
> = {
  "404": {
    imageSrc: "/images/icon/icon-404.svg",
    imageAlt: "404",
    tagline: "NOT FOUND",
    title: "KHÔNG TÌM THẤY TRANG",
    description: "Trang hoặc tài nguyên bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.",
    primaryLabel: "Quay Lại",
    hint: "Hãy kiểm tra lại đường dẫn hoặc thử tìm kiếm nội dung khác.",
  },
  "500": {
    imageSrc: "/images/icon/icon-500.svg",
    imageAlt: "500",
    tagline: "INTERNAL SERVER ERROR",
    title: "CÓ LỖI XẢY RA",
    description: "Hệ thống đang gặp sự cố nội bộ và chưa thể xử lý yêu cầu của bạn.",
    primaryLabel: "Thử Lại",
    hint: "Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu lỗi tiếp tục xảy ra.",
  },
};

const ErrorPage = ({ variant, onPrimaryAction }: ErrorPageProps) => {
  const router = useRouter();
  const copy = COPY[variant];

  const handlePrimary = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
      return;
    }
    if (variant === "500") {
      window.location.reload();
      return;
    }
    gotoBack(router, "/");
  };

  const handleHome = () => router.push("/");

  return (
    <ErrorShellLayout>
      <StackAlignCenter width="100%" maxWidth={720} px={2} gap="16px" pb={{ xs: 6, sm: 4 }}>
        <Box
          width="100%"
          maxWidth={{ xs: 280, md: 400 }}
          lineHeight={0}
          sx={{
            // Keep the heart icon fully visible on short viewports (e.g. DevTools responsive).
            maxHeight: { xs: "36vh", sm: "40vh", md: "42vh" },
            "& img": {
              maxHeight: "inherit",
              width: "auto",
              maxWidth: "100%",
              objectFit: "contain",
            },
          }}
        >
          <Image
            src={copy.imageSrc}
            alt={copy.imageAlt}
            width={400}
            height={200}
            priority
            sizes="(max-width: 899px) 280px, 400px"
            style={{ width: "100%", height: "auto" }}
          />
        </Box>

        <StackRowAlignCenter gap={1.5} width="100%" maxWidth={360}>
          <Box sx={{ flex: 1, height: "1px", bgcolor: "#000" }} />
          <Typography fontSize={12} fontWeight={700} color="#000" whiteSpace="nowrap">
            {copy.tagline}
          </Typography>
          <Box sx={{ flex: 1, height: "1px", bgcolor: "#000" }} />
        </StackRowAlignCenter>

        <Typography fontWeight={700} color="#1C1C1C" textAlign="center" sx={{ fontSize: { xs: 24, sm: 32 } }}>
          {copy.title}
        </Typography>

        <Typography fontSize={16} fontWeight={400} color="#525252" textAlign="center">
          {copy.description}
        </Typography>

        <StackRowAlignJustCenter
          width="100%"
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: "16px", sm: "40px" },
            mt: { xs: 0, sm: "24px" },
          }}
        >
          <Button
            onClick={handlePrimary}
            sx={{
              bgcolor: "#0A0A0A",
              color: "#FFF",
              fontSize: 16,
              fontWeight: 700,
              py: "12px",
              px: "16px",
              borderRadius: 0,
              textTransform: "none",
              minWidth: { xs: "100%", sm: "auto" },
              maxWidth: 320,
              "&:hover": { bgcolor: "#1C1C1C" },
            }}
          >
            {copy.primaryLabel}
          </Button>
          <Button
            onClick={handleHome}
            sx={{
              bgcolor: "#F5F5F5",
              color: "#000",
              fontSize: 16,
              fontWeight: 700,
              py: "12px",
              px: "16px",
              borderRadius: 0,
              textTransform: "none",
              minWidth: { xs: "100%", sm: "auto" },
              maxWidth: 320,
              "&:hover": { bgcolor: "#E8E8E8" },
            }}
          >
            Trang Chủ
          </Button>
        </StackRowAlignJustCenter>

        <Typography fontSize={12} fontWeight={400} color="#00000066" textAlign="center" maxWidth={480}>
          {copy.hint}
        </Typography>
      </StackAlignCenter>
    </ErrorShellLayout>
  );
};

export default ErrorPage;
