import { useEffect, useState } from "react";
import { SITE_HEADER_HEIGHT_FALLBACK_PX } from "@/utils/constants/layout.constant";

export const useHeaderHeight = () => {
  const [headerHeight, setHeaderHeight] = useState(SITE_HEADER_HEIGHT_FALLBACK_PX);

  useEffect(() => {
    const headerElement = document.querySelector("header");
    if (!headerElement) {
      return;
    }

    const updateHeaderHeight = () => {
      setHeaderHeight(headerElement.getBoundingClientRect().height);
    };

    updateHeaderHeight();

    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    resizeObserver.observe(headerElement);

    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, []);

  return headerHeight;
};
