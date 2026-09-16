"use client";

import React, { createContext, useContext } from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import { SWRConfig } from "swr";

import { store } from "@/redux/store";
import EmotionRegistry from "@/libs/EmotionRegistry";
import ThemeRegistry from "@/libs/ThemeRegistry";
import type { LogoType, StorefrontLogoSrcMap } from "@/utils/api/cms/cms.interface";
import { DEFAULT_STOREFRONT_LOGO_SRC, resolveStorefrontLogoSrcMap } from "@/utils/api/cms/cms-logo.util";
import AlertDialog from "@/components/alert-dialog/alert-dialog.component";
import AOSProvider from "@/components/aos-provider/aos-provider.component";
import ChunkErrorRecover from "@/components/chunk-error-recover/chunk-error-recover.component";
import ErrorBoundary from "@/components/error-boundary/error-boundary.component";
import InitializeApp from "@/components/initialize-app/initialize-app.component";
import LoadingScreenOverlay from "@/components/loading-screen-overlay/loading-screen-overlay.component";
import RouterLoadingLinearProgress from "@/components/router-loading-linear-progress/router-loading-linear-progress.component";
import { SWR_DEFAULT_CONFIG } from "@/lib/swr";

const defaultLogoSrcMap = resolveStorefrontLogoSrcMap({}, DEFAULT_STOREFRONT_LOGO_SRC);

const LogoSrcMapContext = createContext<StorefrontLogoSrcMap>(defaultLogoSrcMap);
const BrandNameContext = createContext("");
const ProductDefaultImageContext = createContext("");
const TenantCodeContext = createContext<string | null>(null);

/** Mặc định HEADER — các chỗ khác (header, checkout, …) không cần truyền type. */
export const useLogoSrc = (type: LogoType = "HEADER") => useContext(LogoSrcMapContext)[type];
export const useTenantBrandName = () => useContext(BrandNameContext);
export const useProductDefaultImage = () => useContext(ProductDefaultImageContext);
export const useTenantCode = () => useContext(TenantCodeContext);

type ProvidersProps = {
  children: React.ReactNode;
  logoSrcMap: StorefrontLogoSrcMap;
  brandName: string;
  productDefaultSrc: string;
  tenantCode?: string | null;
};

export default function Providers({ children, logoSrcMap, brandName, productDefaultSrc, tenantCode = null }: ProvidersProps) {
  return (
    <SWRConfig value={SWR_DEFAULT_CONFIG}>
      <Provider store={store}>
        <TenantCodeContext.Provider value={tenantCode}>
          <BrandNameContext.Provider value={brandName}>
            <ProductDefaultImageContext.Provider value={productDefaultSrc}>
              <LogoSrcMapContext.Provider value={logoSrcMap}>
                <EmotionRegistry>
                  <ThemeRegistry>
                    <AOSProvider>
                      <ChunkErrorRecover />
                      <RouterLoadingLinearProgress />
                      <InitializeApp />
                      <ErrorBoundary>{children}</ErrorBoundary>
                      <AlertDialog />
                      <LoadingScreenOverlay />
                      <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar
                        closeOnClick
                        icon={false}
                        theme="light"
                        toastClassName="app-toast"
                        style={{ top: "calc(36px + 64px + 16px)", right: 16 }}
                      />
                    </AOSProvider>
                  </ThemeRegistry>
                </EmotionRegistry>
              </LogoSrcMapContext.Provider>
            </ProductDefaultImageContext.Provider>
          </BrandNameContext.Provider>
        </TenantCodeContext.Provider>
      </Provider>
    </SWRConfig>
  );
}
