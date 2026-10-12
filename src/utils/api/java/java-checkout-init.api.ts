import { commonAxios } from "@/utils/axios";
import { withFreshGuestCartHeader } from "../cart/cart.util";
import { CheckoutRequestLineType, type InitiateCheckoutPayload, type CheckoutSessionItem } from "../checkout/checkout.interface";
import { JAVA_CHECKOUT_POLICY, type JavaCartLine, type JavaDraft, type JavaPage } from "./java-commerce.types";
import { currentJavaOwner, saveJavaDraft } from "./java-checkout.storage";

interface JavaPublicProduct { id: string | number; name: string; thumbnailUrl?: string; skus: Array<{
  id: string | number; skuCode: string; availableStock: number; salePrice: number | null; listPrice: number }> }
async function checkoutRows(items: Array<{ skuId: number; quantity: number }>): Promise<JavaCartLine[]> {
  const cart = (await commonAxios.get<{ items: JavaCartLine[] }>("cart/cart", withFreshGuestCartHeader())).data;
  const rows = [...cart.items];
  let page = 1;
  while (items.some(item => !rows.some(row => Number(row.variationId) === item.skuId))) {
    const result = (await commonAxios.get<JavaPage<JavaPublicProduct>>("storefront/product", { params: { page, take: JAVA_CHECKOUT_POLICY.pageTake } })).data;
    for (const product of result.list) for (const sku of product.skus) rows.push({
      id: String(sku.id), variationId: String(sku.id), productId: String(product.id), name: product.name,
      skuCode: sku.skuCode, found: true, isValid: sku.availableStock > 0, quantity: 1,
      sellingPriceAfterTaxMinor: sku.salePrice ?? sku.listPrice, product: { image: product.thumbnailUrl }
    });
    if (!result.pagination.hasNextPage) break;
    page += 1;
  }
  return rows;
}
function checkoutItem(row: JavaCartLine, quantity: number): CheckoutSessionItem {
  return { variationId: row.variationId, productId: row.productId, productName: row.name, variationName: row.name,
    skuCode: row.skuCode, image: row.product?.image ?? "", quantity, unitPrice: row.sellingPriceAfterTaxMinor,
    salePrice: row.sellingPriceAfterTaxMinor, lineTotal: row.sellingPriceAfterTaxMinor * quantity,
    discountAmount: 0, finalAmount: row.sellingPriceAfterTaxMinor * quantity };
}
export async function javaInitiateCheckout(payload: InitiateCheckoutPayload) {
  if (payload.orderCode || !payload.items?.length) throw new Error("Chọn sản phẩm trước khi thanh toán.");
  const items = payload.items.map(line => {
    if (line.type !== CheckoutRequestLineType.LOOSE || line.selectedPackagingRelationIds?.length)
      throw new Error("Java checkout hiện hỗ trợ sản phẩm lẻ, chưa hỗ trợ bộ sản phẩm hoặc bao bì.");
    const skuId = Number(line.variationId);
    if (!Number.isSafeInteger(skuId) || skuId < 1 || !Number.isSafeInteger(line.quantity) || line.quantity < 1)
      throw new Error("Sản phẩm hoặc số lượng không hợp lệ.");
    return { skuId, quantity: line.quantity };
  });
  const ownerId = await currentJavaOwner(), rows = await checkoutRows(items);
  const total = (await commonAxios.post<{ subTotal: number; discountTotal: number; shippingFee: number; totalAmount: number }>(
    "cart/cart/calculate-total", { items: items.map(line => ({ variationId: String(line.skuId), quantity: line.quantity })) })).data;
  const draft: JavaDraft = { items, ownerId, authenticated: ownerId !== null, expiresAt: Date.now() + JAVA_CHECKOUT_POLICY.ttlMs,
    session: { checkoutSessionId: crypto.randomUUID(), status: "DRAFT", consentThirdPartySharing: false,
      checkoutType: "RETAIL", paymentRequired: true, paymentMethod: JAVA_CHECKOUT_POLICY.paymentMethod,
      shippingMethod: JAVA_CHECKOUT_POLICY.shippingMethod, totalAmount: total.totalAmount,
      pricing: { subtotal: total.subTotal, discountTotal: total.discountTotal, shippingFee: total.shippingFee, taxTotal: 0, grandTotal: total.totalAmount },
      items: items.map(item => { const row = rows.find(candidate => Number(candidate.variationId) === item.skuId);
        if (!row?.found) throw new Error("Sản phẩm không còn được bán."); return checkoutItem(row, item.quantity); }) } };
  saveJavaDraft(draft);
  return draft.session;
}
