"use client";

import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import Image from "next/image";
import useStyles from "../order-info/order-info.styles";
import { StackRowAlignCenter } from "@/components/styled";

const isEvidenceVideoUrl = (url: string) => {
  const base = url.split("?")[0] ?? "";
  const ext = base.includes(".") ? base.split(".").pop()?.toLowerCase() : "";
  return ["mp4", "avi", "mov", "mkv", "webm", "ogg"].includes(ext ?? "");
};

export interface OrderReturnDetailReasonSectionProps {
  reasonLabel: string;
  note?: string;
  evidenceImageUrls: string[];
  type?: string;
}

const OrderReturnDetailReasonSection = ({ reasonLabel, note, evidenceImageUrls, type }: OrderReturnDetailReasonSectionProps) => {
  const { classes } = useStyles();

  return (
    <Box className={classes.root} sx={{ mb: 0 }}>
      <Typography className={classes.title}>Lý do đổi trả/hoàn tiền</Typography>
      <Stack className={classes.reasonInfoList}>
        <Stack>
          <Typography className={classes.infoLabel}>Loại yêu cầu</Typography>
          <Typography className={classes.value}>{type}</Typography>
        </Stack>
        <Stack>
          <Typography className={classes.infoLabel}>Lý do</Typography>
          <Typography className={classes.value}>{reasonLabel}</Typography>
        </Stack>
        {note ? (
          <Stack>
            <Typography className={classes.infoLabel}>Ghi chú</Typography>
            <Typography className={classes.value}>{note}</Typography>
          </Stack>
        ) : null}
      </Stack>
      {evidenceImageUrls.length > 0 && (
        <Box>
          <Typography className={classes.infoLabel} sx={{ mb: 1 }}>
            Hình ảnh / video minh chứng
          </Typography>
          <StackRowAlignCenter gap="16px" sx={{ flexWrap: "wrap" }}>
            {evidenceImageUrls.map((url, index) => (
              <Box
                key={`${url}-${index}`}
                sx={{
                  position: "relative",
                  width: 80,
                  height: 80,
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #E5E7EB",
                  flexShrink: 0,
                  backgroundColor: "#F9FAFB",
                }}
              >
                {isEvidenceVideoUrl(url) ? (
                  <Box
                    component="video"
                    src={url}
                    muted
                    preload="metadata"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <Image src={url} alt={`Minh chứng ${index + 1}`} fill style={{ objectFit: "cover" }} unoptimized />
                )}
              </Box>
            ))}
          </StackRowAlignCenter>
        </Box>
      )}
    </Box>
  );
};

export default OrderReturnDetailReasonSection;
