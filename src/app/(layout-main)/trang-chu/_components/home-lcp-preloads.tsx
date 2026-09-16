"use client";

import ReactDOM from "react-dom";
import type { HomeImagePreload } from "@/lib/server/home-fetch.server";

type HomeLcpImagePreloadsProps = {
  preloads: HomeImagePreload[];
};

const preloadHomeImage = (preload: HomeImagePreload): void => {
  ReactDOM.preload(preload.href, {
    as: "image",
    media: preload.media,
  });
};

const HomeLcpImagePreloads = ({ preloads }: HomeLcpImagePreloadsProps) => {
  preloads.forEach(preloadHomeImage);
  return null;
};

export default HomeLcpImagePreloads;
