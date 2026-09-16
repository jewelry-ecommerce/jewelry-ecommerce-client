import type { PostCartLine } from "@/utils/api/cart/cart.util";
import { readStoredUtmData } from "./utm.util";

export function attachUtmDataToCartLine(line: PostCartLine): PostCartLine {
  if (line.quantity <= 0) return line;

  return {
    ...line,
    utm_data: readStoredUtmData(),
  };
}

export function attachUtmDataToCartLines(lines: PostCartLine[]): PostCartLine[] {
  return lines.map(attachUtmDataToCartLine);
}
