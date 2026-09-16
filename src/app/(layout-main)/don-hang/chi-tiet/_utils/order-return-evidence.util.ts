import type { TextFieldUploadImagesValue } from "@/components/text-field/text-field-upload-images.component";
import { ORDER_RETURN_DRAFT_MAX_EVIDENCE } from "@/app/(layout-main)/don-hang/chi-tiet/_interfaces/order-return-draft.interface";

/** URL đã upload — chấp nhận absolute, protocol-relative và path CDN. */
export function isPersistableEvidenceUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  const s = url.trim();
  if (!s) return false;
  return s.startsWith("https://") || s.startsWith("http://") || s.startsWith("//") || s.startsWith("/");
}

/** Khôi phục danh sách bằng chứng từ URL đã upload (không có File local). */
export function evidenceValuesFromUrls(urls: string[]): TextFieldUploadImagesValue[] {
  return urls
    .filter(isPersistableEvidenceUrl)
    .slice(0, ORDER_RETURN_DRAFT_MAX_EVIDENCE)
    .map((rawUrl, index) => {
      const uploadedUrl = rawUrl.startsWith("//") ? `https:${rawUrl}` : rawUrl;
      return {
        id: `draft-evidence-${index}`,
        previewUrl: uploadedUrl,
        uploadedUrl,
      };
    });
}

/** Gộp draft — không ghi đè URL cũ bằng mảng rỗng (race sau hydrate). */
export function mergeDraftEvidenceUrls(partial: string[] | undefined, existing: string[] | undefined): string[] | undefined {
  if (partial !== undefined && partial.length > 0) return partial;
  if (existing !== undefined && existing.length > 0) return existing;
  return partial ?? existing;
}

/** Lấy File local để gửi FormData lúc submit. */
export function evidenceFilesFromValues(values: TextFieldUploadImagesValue[]): File[] {
  return values.map((value) => value.file).filter((file): file is File => file instanceof File);
}

export function evidenceUrlsFromValues(values: TextFieldUploadImagesValue[]): string[] {
  return values.map((v) => v.uploadedUrl).filter((url): url is string => Boolean(url));
}
