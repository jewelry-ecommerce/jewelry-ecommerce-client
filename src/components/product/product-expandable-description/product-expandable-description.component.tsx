import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { isCmsRichTextHtmlEmpty } from "@/utils/api/cms/cms-rich-text.utils";
import { ServerSafeContent } from "@/components/server-safe-content/server-safe-content.component";
import type { ProductExpandableDescriptionProps } from "./product-expandable-description.interface";
import useStyles from "./product-expandable-description.styles";

const ProductExpandableDescription = ({ title, description, maxCollapsedLines = 3, sx }: ProductExpandableDescriptionProps) => {
  const { classes, cx } = useStyles();
  const [expanded, setExpanded] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setExpanded(false);
  }, [description]);

  useLayoutEffect(() => {
    if (isCmsRichTextHtmlEmpty(description)) {
      setHasMore(false);
      return;
    }
    const el = textRef.current;
    if (!el || expanded) {
      return;
    }
    const check = () => setHasMore(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [description, expanded]);

  return (
    <Box className={classes.root} sx={sx}>
      <Typography className={classes.title}>{title}</Typography>

      <ServerSafeContent
        ref={textRef}
        component="div"
        className={cx("ck-content", expanded ? classes.descriptionExpanded : classes.descriptionCollapsed)}
        sx={!expanded ? { WebkitLineClamp: maxCollapsedLines } : undefined}
        rawHtml={description}
      />

      {(hasMore || expanded) && (
        <button type="button" className={classes.toggleButton} onClick={() => setExpanded((v) => !v)}>
          {expanded ? "THU GỌN" : "XEM THÊM"}
        </button>
      )}
    </Box>
  );
};

export default ProductExpandableDescription;
