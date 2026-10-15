import { AxiosError, type AxiosResponse } from "axios";
import { getJavaHttpStatus, isJavaBackend, unwrapJavaResponse } from "../config/java-backend.config";

export function normalizeJavaAxiosResponse<T>(response: AxiosResponse<T>): AxiosResponse<T> {
  if (!isJavaBackend()) return response;
  const status = getJavaHttpStatus(response.data, response.status);
  if (status >= 400) {
    const payload: unknown = response.data;
    const message = payload && typeof payload === "object" && "message" in payload
      && typeof payload.message === "string" ? payload.message : "Yêu cầu không thành công.";
    throw new AxiosError(message, "JAVA_BUSINESS_ERROR", response.config, response.request, { ...response, status });
  }
  response.data = unwrapJavaResponse(response.data) as T;
  return response;
}
