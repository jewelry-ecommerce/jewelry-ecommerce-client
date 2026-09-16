"use client";

import { useLayoutEffect } from "react";
import { ATSH_PAGE_BACKGROUND } from "@/app/(layout-main)/atsh/_constants/atsh-loading.constants";
import { isAtshSectionScrollInProgress, isAtshSpiralSectionActive } from "@/app/(layout-main)/atsh/_utils/atsh-section-scroll.util";

/** Khóa layout trang landing `/atsh` — không cho document scroll. */
export function useAtshLandingPageLayoutLock(enabled: boolean) {
  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const footer = document.querySelector("footer") as HTMLElement | null;
    const main = document.querySelector("main") as HTMLElement | null;
    const layoutWrapper = main?.parentElement as HTMLElement | null;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlHeight = html.style.height;
    const prevBodyHeight = body.style.height;
    const prevHtmlMaxHeight = html.style.maxHeight;
    const prevBodyMaxHeight = body.style.maxHeight;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyLeft = body.style.left;
    const prevBodyRight = body.style.right;
    const prevBodyWidth = body.style.width;
    const prevBodyBackground = body.style.backgroundColor;
    const prevHtmlBackground = html.style.backgroundColor;
    const prevMainMinHeight = main?.style.minHeight ?? "";
    const prevMainOverflow = main?.style.overflow ?? "";
    const prevMainHeight = main?.style.height ?? "";
    const prevMainFlex = main?.style.flex ?? "";
    const prevMainPadding = main?.style.padding ?? "";
    const prevLayoutMinHeight = layoutWrapper?.style.minHeight ?? "";
    const prevLayoutOverflow = layoutWrapper?.style.overflow ?? "";
    const prevLayoutHeight = layoutWrapper?.style.height ?? "";
    const prevLayoutMaxHeight = layoutWrapper?.style.maxHeight ?? "";
    const prevLayoutPaddingTop = layoutWrapper?.style.paddingTop ?? "";
    const prevHtmlOverscroll = html.style.overscrollBehaviorY;
    const prevBodyOverscroll = body.style.overscrollBehaviorY;
    const prevBodyTouchAction = body.style.touchAction;
    const prevFooterDisplay = footer?.style.display;

    html.style.height = "100%";
    html.style.maxHeight = "100%";
    html.style.overflow = "hidden";
    html.style.overscrollBehaviorY = "none";

    body.style.height = "100%";
    body.style.maxHeight = "100%";
    body.style.overflow = "hidden";
    body.style.overscrollBehaviorY = "none";
    body.style.touchAction = "none";
    body.style.position = "fixed";
    body.style.top = "0";
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    if (footer) {
      footer.style.display = "none";
    }

    if (main) {
      main.style.minHeight = "0";
      main.style.height = "0";
      main.style.flex = "0 0 auto";
      main.style.overflow = "hidden";
      main.style.padding = "0";
    }

    if (layoutWrapper) {
      layoutWrapper.style.minHeight = "0";
      layoutWrapper.style.height = "auto";
      layoutWrapper.style.maxHeight = "none";
      layoutWrapper.style.overflow = "hidden";
      layoutWrapper.style.paddingTop = "0";
    }

    body.style.backgroundColor = ATSH_PAGE_BACKGROUND;
    html.style.backgroundColor = ATSH_PAGE_BACKGROUND;

    const preventKeyScroll = (event: KeyboardEvent) => {
      const keys = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "];
      if (keys.includes(event.key)) {
        event.preventDefault();
      }
    };

    const preventUserScroll = (event: Event) => {
      if (isAtshSpiralSectionActive() && (event.type === "touchmove" || event.type === "wheel")) {
        return;
      }

      event.preventDefault();
    };

    const pinWindowScroll = () => {
      if (isAtshSectionScrollInProgress()) {
        return;
      }

      if (window.scrollY !== 0 || document.documentElement.scrollTop !== 0 || document.body.scrollTop !== 0) {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    pinWindowScroll();

    window.addEventListener("keydown", preventKeyScroll, { passive: false });
    window.addEventListener("wheel", preventUserScroll, { passive: false, capture: true });
    window.addEventListener("touchmove", preventUserScroll, { passive: false, capture: true });
    window.addEventListener("scroll", pinWindowScroll, { passive: true });

    return () => {
      window.removeEventListener("keydown", preventKeyScroll);
      window.removeEventListener("wheel", preventUserScroll, { capture: true });
      window.removeEventListener("touchmove", preventUserScroll, { capture: true });
      window.removeEventListener("scroll", pinWindowScroll);

      html.style.overflow = prevHtmlOverflow;
      html.style.height = prevHtmlHeight;
      html.style.maxHeight = prevHtmlMaxHeight;
      body.style.overflow = prevBodyOverflow;
      body.style.height = prevBodyHeight;
      body.style.maxHeight = prevBodyMaxHeight;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.left = prevBodyLeft;
      body.style.right = prevBodyRight;
      body.style.width = prevBodyWidth;
      html.style.overscrollBehaviorY = prevHtmlOverscroll;
      body.style.overscrollBehaviorY = prevBodyOverscroll;
      body.style.touchAction = prevBodyTouchAction;

      if (footer) {
        footer.style.display = prevFooterDisplay || "";
      }

      if (main) {
        main.style.minHeight = prevMainMinHeight;
        main.style.height = prevMainHeight;
        main.style.flex = prevMainFlex;
        main.style.overflow = prevMainOverflow;
        main.style.padding = prevMainPadding;
      }

      if (layoutWrapper) {
        layoutWrapper.style.minHeight = prevLayoutMinHeight;
        layoutWrapper.style.height = prevLayoutHeight;
        layoutWrapper.style.maxHeight = prevLayoutMaxHeight;
        layoutWrapper.style.overflow = prevLayoutOverflow;
        layoutWrapper.style.paddingTop = prevLayoutPaddingTop;
      }

      body.style.backgroundColor = prevBodyBackground;
      html.style.backgroundColor = prevHtmlBackground;
    };
  }, [enabled]);
}
