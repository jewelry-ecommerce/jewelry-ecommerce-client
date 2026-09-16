"use client";

import { useCallback, useState } from "react";
import type { TextFieldUploadImagesValue } from "@/components/text-field/text-field-upload-images.component";
import { evidenceValuesFromUrls } from "@/app/(layout-main)/don-hang/chi-tiet/_utils/order-return-evidence.util";

export interface UseOrderReturnEvidenceOptions {
  /** URL remote (legacy draft) — chỉ dùng để preview, không còn upload sớm. */
  initialUrls?: string[];
}

/**
 * Hook dùng chung cho flow đổi hàng / hoàn tiền:
 * - Quản lý state ảnh/video bằng chứng (File local + blob preview).
 * - Không upload khi chọn; file sẽ gửi kèm FormData lúc submit.
 */
export function useOrderReturnEvidence(options?: UseOrderReturnEvidenceOptions) {
  const [evidenceImages, setEvidenceImages] = useState<TextFieldUploadImagesValue[]>(() =>
    options?.initialUrls?.length ? evidenceValuesFromUrls(options.initialUrls) : [],
  );

  const handleEvidenceImagesChange = useCallback((next: TextFieldUploadImagesValue[]) => {
    setEvidenceImages(next);
  }, []);

  const replaceFromUrls = useCallback((urls: string[]) => {
    setEvidenceImages(evidenceValuesFromUrls(urls));
  }, []);

  return {
    evidenceImages,
    handleEvidenceImagesChange,
    /** Giữ API cũ cho UI — luôn false vì không upload sớm nữa. */
    isEvidenceUploading: false,
    replaceFromUrls,
    setEvidenceImages,
  };
}
