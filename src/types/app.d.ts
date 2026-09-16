declare module "react-html-parser";
declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

type GtagArgument = string | number | boolean | Date | Record<string, unknown>;
type DataLayerEntry = Record<string, unknown> | IArguments | GtagArgument[];
interface WorldfoneOscWidgetUser {
  setName: (name: string) => void;
  setPhone: (phone: string) => void;
  setEmail: (email: string) => void;
  setAddress: (address: string) => void;
  setProperties: (properties: Record<string, string>) => void;
}

interface WorldfoneOscWidget {
  init: (options: { token: string }) => void;
  user?: WorldfoneOscWidgetUser;
}

interface Window {
  NextPublic: {
    lang: "en" | "vi";
    version: string;
  };
  dataLayer?: DataLayerEntry[];
  gtag?: (...args: GtagArgument[]) => void;
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  oscWidget?: WorldfoneOscWidget;
  __worldfoneLivechatInitialized?: boolean;
}
declare global {
  declare namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      ANALYZE?: string;

      /** Runtime — K8s / container */
      API_BE_URL?: string;
      TENANT_CODE?: string;
      ALLOW_SELF_SIGNED_TLS?: string;
      AUTH_COOKIE_SECURE?: string;
      TENANT_BRAND_NAME?: string;
      TENANT_BRAND_LOGO?: string;
      TENANT_BRAND_PRODUCT_DEFAULT_IMAGE?: string;

      /** Build-time public (NEXT_PUBLIC_*) */
      NEXT_PUBLIC_CDN_MEDIA_DOMAIN?: string;
      NEXT_PUBLIC_SITE_URL?: string;
      NEXT_PUBLIC_VERCEL_ENV?: string;
    }
  }
}
