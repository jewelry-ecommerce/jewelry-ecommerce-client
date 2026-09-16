import type { SxProps, Theme } from "@mui/material";
import type { CmsRichTextHtml } from "@/utils/api/cms/cms.interface";

export interface ProductExpandableDescriptionProps {
  title: string;
  description: CmsRichTextHtml;
  maxCollapsedLines?: number;
  sx?: SxProps<Theme>;
}
