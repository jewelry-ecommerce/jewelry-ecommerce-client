const SIZE_ATTRIBUTE_CODES = new Set(["SIZE", "KC"]);

const SIZE_ATTRIBUTE_NAME_PATTERN = /size|kích\s*cỡ|kich\s*co/i;

export type SizeVariantAttributeRef = {
  code?: string | null;
  name?: string | null;
};

export function isSizeVariantAttribute(attribute: SizeVariantAttributeRef): boolean {
  const code = attribute.code?.trim().toUpperCase();
  if (code && SIZE_ATTRIBUTE_CODES.has(code)) {
    return true;
  }

  const name = attribute.name?.trim();
  if (!name) {
    return false;
  }

  return SIZE_ATTRIBUTE_NAME_PATTERN.test(name);
}

export function resolveSizeGuideAttributeCode(selectors: Array<{ attribute: SizeVariantAttributeRef }>): string | undefined {
  const match = selectors.find((selector) => isSizeVariantAttribute(selector.attribute));
  return match?.attribute.code ?? undefined;
}

export function isSizeAttributeCode(code?: string | null): boolean {
  if (!code) {
    return false;
  }
  return SIZE_ATTRIBUTE_CODES.has(code.trim().toUpperCase());
}
