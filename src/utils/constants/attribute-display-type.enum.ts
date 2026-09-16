export enum AttributeDisplayType {
  IMAGE = "IMAGE",
  TEXT = "TEXT",
}

export const isImageAttributeDisplayType = (displayType?: string | null): boolean =>
  displayType?.toUpperCase() === AttributeDisplayType.IMAGE;

export const isTextAttributeDisplayType = (displayType?: string | null): boolean =>
  displayType?.toUpperCase() === AttributeDisplayType.TEXT;

export const normalizeAttributeDisplayType = (displayType?: string | null): AttributeDisplayType =>
  isImageAttributeDisplayType(displayType) ? AttributeDisplayType.IMAGE : AttributeDisplayType.TEXT;
