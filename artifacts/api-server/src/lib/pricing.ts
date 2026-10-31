import { getProduct, shippingFor, CURRENCY } from "@workspace/catalog";
import type { OrderItemSnapshot } from "@workspace/db";

export type CartLineInput = { handle: string; variantId: string; qty: number };

export class PricingError extends Error {}

/** يحسب الطلب بالكامل من كتالوج الخادم. لا يُقبل أي سعر قادم من المتصفح. */
export function priceCart(lines: CartLineInput[]) {
  const merged = new Map<string, CartLineInput>();
  for (const l of lines) {
    const key = `${l.handle}::${l.variantId}`;
    const prev = merged.get(key);
    merged.set(key, { ...l, qty: Math.min(10, (prev?.qty ?? 0) + l.qty) });
  }
  const items: OrderItemSnapshot[] = [];
  for (const l of merged.values()) {
    const product = getProduct(l.handle);
    const variant = product?.variants.find((v) => v.id === l.variantId);
    if (!product || !variant) throw new PricingError(`المنتج غير موجود: ${l.handle}`);
    if (!variant.available) throw new PricingError(`غير متوفر حاليًا: ${product.title} — ${variant.title}`);
    items.push({ handle: product.handle, variantId: variant.id, title: product.title, variantTitle: variant.title, unitPrice: variant.price, qty: l.qty });
  }
  if (items.length === 0) throw new PricingError("السلة فارغة");
  const subtotal = items.reduce((a, i) => a + i.unitPrice * i.qty, 0);
  const shipping = shippingFor(subtotal);
  return { items, subtotal, shipping, total: subtotal + shipping, currency: CURRENCY };
}
