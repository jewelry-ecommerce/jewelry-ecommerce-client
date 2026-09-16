export const isCmsRichTextHtmlEmpty = (html?: string | null): boolean => {
  if (!html?.trim()) return true;
  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return text.length === 0;
};
