import { and, eq, ne } from "drizzle-orm";
import { db, ordersTable, type Order } from "@workspace/db";
import { verifyStripe } from "./payments/stripe";
import { verifyPaypal } from "./payments/paypal";
import { verifyCrypto } from "./payments/btcpay";
import type { RemoteStatus } from "./payments/types";

export const orderDto = (o: Order) => ({
  id: o.id,
  status: o.status as "pending" | "paid" | "failed" | "cancelled" | "expired",
  paymentProvider: o.paymentProvider as "stripe" | "paypal" | "crypto",
  currency: o.currency,
  subtotal: o.subtotal,
  shipping: o.shipping,
  total: o.total,
  items: o.items,
  shippingAddress: {
    fullName: o.shippingAddress.fullName,
    phone: o.shippingAddress.phone,
    country: o.shippingAddress.country,
    city: o.shippingAddress.city,
    line1: o.shippingAddress.line1,
    line2: o.shippingAddress.line2 ?? null,
    postalCode: o.shippingAddress.postalCode ?? null,
  },
  createdAt: o.createdAt,
  paidAt: o.paidAt,
});

/** يطبّق حالة مؤكدة من المزوّد. الدفع النهائي لا يُنقض: الطلب المدفوع يبقى مدفوعًا. */
export async function applyRemoteStatus(order: Order, remote: RemoteStatus): Promise<Order> {
  if (order.status === "paid" || remote === "pending" || remote === order.status) return order;
  const patch = remote === "paid" ? { status: "paid", paidAt: new Date() } : { status: remote };
  const [row] = await db.update(ordersTable).set(patch).where(and(eq(ordersTable.id, order.id), ne(ordersTable.status, "paid"))).returning();
  return row ?? order;
}

/** يسأل المزوّد عن حالة الطلب المعلّق ويحدّثه. */
export async function refreshOrder(order: Order): Promise<Order> {
  if (order.status === "paid" || !order.providerRef) return order;
  let remote: RemoteStatus;
  switch (order.paymentProvider) {
    case "stripe": remote = await verifyStripe(order.providerRef, order.total); break;
    case "paypal": remote = await verifyPaypal(order.providerRef, order.total, order.id); break;
    case "crypto": remote = await verifyCrypto(order.providerRef, order.total, order.currency); break;
    default: return order;
  }
  return applyRemoteStatus(order, remote);
}
