"use client";

import { Box, type BoxProps } from "@mui/material";
import DOMPurify from "isomorphic-dompurify";
import { forwardRef, useMemo } from "react";

interface ServerSafeContentProps extends Omit<BoxProps, "children" | "dangerouslySetInnerHTML"> {
  rawHtml: string;
}

/**
 * Renders API/CMS HTML via DOMPurify default sanitize (isomorphic-dompurify).
 */
export const ServerSafeContent = forwardRef<HTMLElement, ServerSafeContentProps>(function ServerSafeContent({ rawHtml, ...boxProps }, ref) {
  const cleanHtml = useMemo(() => DOMPurify.sanitize(rawHtml ?? ""), [rawHtml]);

  if (!cleanHtml) {
    return null;
  }

  return <Box ref={ref} dangerouslySetInnerHTML={{ __html: cleanHtml }} {...boxProps} />;
});
