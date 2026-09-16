import axios from "axios";
import { shouldRedirectStorefront404To404Page } from "@/utils/api/storefront-api.util";
import { getApiBeUrl, getTenantCode } from "../config/common";
import { isAuthStatusCode } from "./auth-error.util";

const resolveBaseUrl = () => (typeof window === "undefined" ? getApiBeUrl() || "http://127.0.0.1:3100/api/mock" : "/api/mock");

const commonAxios = axios.create({
  baseURL: resolveBaseUrl(),
  withCredentials: true,
});

commonAxios.interceptors.request.use(
  (req) => {
    req.headers = req.headers ?? {};

    if (!(req.headers as Record<string, string>).Language) {
      (req.headers as Record<string, string>).Language = "en_US";
    }

    const tenantCode = getTenantCode();
    if (tenantCode) {
      (req.headers as Record<string, string>)["x-tenant-code"] = tenantCode;
    }

    switch ((req.method as string).toUpperCase()) {
      case "GET": {
        req.params = req.params || {};
        break;
      }
      case "POST":
      case "PUT":
      case "DELETE":
      default:
        break;
    }
    return req;
  },
  (err) => {
    console.log(err);
    return Promise.reject(err);
  },
);

commonAxios.interceptors.response.use(
  (res) => res,
  (err) => {
    const { status, data } = err.response || {};
    const requestUrl = String(err.config?.url ?? "");
    const statusCode = data?.statusCode ?? status;

    if (status === 404 && typeof window !== "undefined" && shouldRedirectStorefront404To404Page(requestUrl)) {
      if (!window.location.pathname.startsWith("/404")) {
        window.location.assign("/404");
      }
      return Promise.reject(err);
    }

    if (isAuthStatusCode(status, statusCode)) {
      return Promise.reject(err);
    }

    return Promise.reject(err);
  },
);

export default commonAxios;
