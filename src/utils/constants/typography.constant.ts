// Typography scale with weights:
// regular: 400, medium: 500, semiBold: 600, bold: 700
const createTypographyStyle = (fontWeight: 400 | 500 | 600 | 700, fontSize: string, lineHeight: string) => ({
  fontWeight,
  fontSize,
  lineHeight,
  letterSpacing: "0%",
  verticalAlign: "middle",
  fontFamily: "var(--font-hanken-grotesk), sans-serif",
});

const createTypographyScale = (fontSize: string, lineHeight: string) => ({
  regular: createTypographyStyle(400, fontSize, lineHeight),
  medium: createTypographyStyle(500, fontSize, lineHeight),
  semiBold: createTypographyStyle(600, fontSize, lineHeight),
  bold: createTypographyStyle(700, fontSize, lineHeight),
});

export const TYPOGRAPHY_STYLES = {
  "5xl": createTypographyScale("48px", "150%"),
  "4xl": createTypographyScale("32px", "150%"),
  "3xl": createTypographyScale("28px", "150%"),
  "2xl": createTypographyScale("24px", "150%"),
  xl: createTypographyScale("20px", "150%"),
  lg: createTypographyScale("18px", "150%"),
  md: createTypographyScale("16px", "150%"),
  base: createTypographyScale("14px", "150%"),
  sm: createTypographyScale("12px", "150%"),
  xs: createTypographyScale("10px", "150%"),
};
