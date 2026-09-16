import { Typography } from "@mui/material";
import { isCmsRichTextHtmlEmpty } from "@/utils/api/cms/cms-rich-text.utils";
import { TYPOGRAPHY_STYLES } from "@/utils/constants/typography.constant";
import { StackAlignJustCenter } from "@/components/styled";
import { ServerSafeContent } from "@/components/server-safe-content/server-safe-content.component";

export interface CmsTextBlockProps {
  title?: string;
  content?: string;
}

const cmsTextBlockContentSx = {
  width: "100%",
  maxWidth: "100%",
  "& img": {
    maxWidth: "100%",
    width: "auto",
    height: "auto",
    aspectRatio: "auto",
  },
  "& figure.image": {
    display: "block",
    width: "fit-content",
    maxWidth: "100%",
    margin: "1em auto",
    textAlign: "center",
  },
  "& figure.image.image_resized": {
    width: "auto",
    maxWidth: "100%",
  },
  "& figure.image.image_resized img": {
    width: "100%",
  },
  "& figure.image > figcaption": {
    display: "block",
    textAlign: "center",
    backgroundColor: "transparent",
    padding: "0.5em 0 0",
    fontSize: "0.875rem",
    color: "#6B7280",
  },
  "& figure.media": {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    margin: "1em auto",
  },
  "& figure.media > div": {
    width: "100%",
  },
  "& video": {
    display: "block",
    width: "100%",
    maxWidth: "100%",
    height: "auto",
    margin: "0 auto",
  },
} as const;

const CmsTextBlock = ({ title, content }: CmsTextBlockProps) => {
  const normalizedTitle = title?.trim() ?? "";
  if (!normalizedTitle && isCmsRichTextHtmlEmpty(content)) {
    return null;
  }

  return (
    <StackAlignJustCenter
      sx={{ gap: { xs: 2, md: 5 }, width: "100%", maxWidth: "800px", margin: "0 auto", py: { xs: "20px", lg: "60px" }, px: 2 }}
    >
      {normalizedTitle ? (
        <Typography
          component="h2"
          sx={{
            ...TYPOGRAPHY_STYLES.xl.bold,
            color: "#27251F",
          }}
        >
          {normalizedTitle}
        </Typography>
      ) : null}
      {!isCmsRichTextHtmlEmpty(content) ? (
        <ServerSafeContent component="div" className="ck-content" sx={cmsTextBlockContentSx} rawHtml={content ?? ""} />
      ) : null}
    </StackAlignJustCenter>
  );
};

export default CmsTextBlock;
