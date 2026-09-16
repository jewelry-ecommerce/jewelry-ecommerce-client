import React, { useEffect, useRef, useState } from "react";
import { Box, Modal, Stack, Typography, type SxProps, type Theme } from "@mui/material";
import { Play, XClose } from "@untitledui/icons";
import { StackRowAlignCenter, StackRowAlignJustCenter, StackRowWrap } from "@/components/styled";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";

export interface TextFieldUploadImagesValue {
  id: string;
  file?: File;
  previewUrl: string;
  uploadedUrl?: string;
  mediaAssetId?: string;
}

interface TextFieldUploadImagesComponentProps {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  values: TextFieldUploadImagesValue[];
  onChange: (values: TextFieldUploadImagesValue[]) => void;
  accept?: string;
  maxImages?: number;
  sx?: SxProps<Theme>;
  sxImage?: SxProps<Theme>;
  uploadIcon?: React.ReactNode;
}

export const isVideo = (filenameOrUrl: string) => {
  const base = filenameOrUrl.split("?")[0] ?? "";
  const ext = base.includes(".") ? base.split(".").pop() : "";
  return ["mp4", "avi", "mov", "mkv", "webm"].includes(ext?.toLowerCase() || "");
};

const getDisplaySrc = (item: TextFieldUploadImagesValue) => item.uploadedUrl || item.previewUrl;

const isVideoItem = (item: TextFieldUploadImagesValue) =>
  isVideo(item.file?.name ?? "") || isVideo(item.uploadedUrl ?? "") || isVideo(item.previewUrl ?? "");

const TextFieldUploadImagesComponent: React.FC<TextFieldUploadImagesComponentProps> = ({
  label,
  required = false,
  helperText,
  error,
  values,
  onChange,
  accept = "image/*",
  maxImages = 3,
  sx,
  sxImage,
  uploadIcon,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const createdPreviewUrlsRef = useRef<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<TextFieldUploadImagesValue | null>(null);

  useEffect(() => {
    if (!previewItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewItem(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewItem]);

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files || []);
    const availableSlots = Math.max(maxImages - values.length, 0);
    const acceptedFiles = nextFiles.slice(0, availableSlots);

    if (acceptedFiles.length === 0) {
      event.target.value = "";
      return;
    }

    const nextValues = acceptedFiles.map((file, index) => {
      const previewUrl = URL.createObjectURL(file);
      createdPreviewUrlsRef.current.add(previewUrl);

      return {
        id: `${file.name}-${file.size}-${Date.now()}-${index}`,
        file,
        previewUrl,
      };
    });

    onChange([...values, ...nextValues]);
    event.target.value = "";
  };

  const handleRemoveImage = (id: string) => {
    const removedValue = values.find((value) => value.id === id);
    const blobUrl = removedValue?.previewUrl;
    if (blobUrl?.startsWith("blob:") && createdPreviewUrlsRef.current.has(blobUrl)) {
      URL.revokeObjectURL(blobUrl);
      createdPreviewUrlsRef.current.delete(blobUrl);
    }

    onChange(values.filter((value) => value.id !== id));
  };

  const canAddMore = values.length < maxImages;

  return (
    <Stack gap="8px" sx={{ width: "100%", ...sx }}>
      {label && (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: "#27251F" }}>
          {label}
          {required && <span style={{ color: "#EF4444" }}>*</span>}
        </Typography>
      )}

      <StackRowWrap gap="12px">
        {values.map((value) => {
          const videoItem = isVideoItem(value);
          const displaySrc = getDisplaySrc(value);
          return (
            <Box
              key={value.id}
              onClick={() => setPreviewItem(value)}
              sx={{
                position: "relative",
                width: "100px",
                height: "100px",
                border: "1px solid #DEDEDE",
                borderRadius: "4px",
                overflow: "hidden",
                backgroundColor: "#F9FAFB",
                flexShrink: 0,
                cursor: "pointer",
                ...sxImage,
              }}
            >
              {videoItem ? (
                <>
                  <video
                    src={displaySrc}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    muted
                    preload="metadata"
                  />
                  <StackRowAlignJustCenter
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.28)",
                      pointerEvents: "none",
                    }}
                  >
                    <StackRowAlignJustCenter
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.6)",
                      }}
                    >
                      <Play size={16} />
                    </StackRowAlignJustCenter>
                  </StackRowAlignJustCenter>
                </>
              ) : (
                <Box component="img" src={displaySrc} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}

              <StackRowAlignJustCenter
                onClick={(event) => {
                  event.stopPropagation();
                  handleRemoveImage(value.id);
                }}
                sx={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(17, 17, 17, 0.72)",
                  cursor: "pointer",
                  zIndex: 1,
                }}
              >
                <XClose size={12} color="#FFFFFF" />
              </StackRowAlignJustCenter>
            </Box>
          );
        })}

        <StackRowAlignJustCenter
          onClick={() => canAddMore && inputRef.current?.click()}
          sx={{
            width: "100px",
            height: "100px",
            border: `1px dashed ${error ? "#EF4444" : "#D4D4D8"}`,
            borderRadius: "4px",
            cursor: canAddMore ? "pointer" : "not-allowed",
            opacity: canAddMore ? 1 : 0.5,
            backgroundColor: "#FAFAFA",
            flexShrink: 0,
          }}
        >
          <StackRowAlignCenter sx={{ width: "100%", height: "100%", justifyContent: "center" }}>
            <Stack alignItems="center" gap="2px">
              {uploadIcon || <Typography sx={{ ...TYPOGRAPHY_STYLES.base.bold, color: "#27251F", lineHeight: 1 }}>+</Typography>}
              <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: "#71717A" }}>
                {values.length}/{maxImages}
              </Typography>
            </Stack>
          </StackRowAlignCenter>
        </StackRowAlignJustCenter>
      </StackRowWrap>

      <Box component="input" ref={inputRef} type="file" accept={accept} multiple onChange={handleSelectFiles} sx={{ display: "none" }} />

      {(error || helperText) && (
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: error ? "#EF4444" : "#71717A" }}>{error || helperText}</Typography>
      )}

      <Modal
        open={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <StackRowAlignJustCenter
          onClick={() => setPreviewItem(null)}
          sx={{
            position: "relative",
            maxWidth: "90vw",
            maxHeight: "90vh",
            outline: "none",
            borderRadius: "8px",
            overflow: "hidden",
            backgroundColor: "#000",
          }}
        >
          {previewItem && isVideoItem(previewItem) ? (
            <video
              src={getDisplaySrc(previewItem)}
              controls
              autoPlay
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "90vw", maxHeight: "90vh", display: "block" }}
            />
          ) : previewItem ? (
            <Box
              component="img"
              src={getDisplaySrc(previewItem)}
              alt="preview"
              onClick={(e) => e.stopPropagation()}
              sx={{ maxWidth: "90vw", maxHeight: "90vh", display: "block", objectFit: "contain" }}
            />
          ) : null}

          <StackRowAlignJustCenter
            onClick={() => setPreviewItem(null)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "rgba(17,17,17,0.72)",
              cursor: "pointer",
              zIndex: 1,
            }}
          >
            <XClose size={16} color="#FFFFFF" />
          </StackRowAlignJustCenter>
        </StackRowAlignJustCenter>
      </Modal>
    </Stack>
  );
};

export default TextFieldUploadImagesComponent;
