import Stripe from "stripe";
import { envPresent, ProviderRequestError, requireEnv, type OrderForPayment, type RemoteStatus, type StartResult } from "./types";

const KEYS = ["STRIPE_SECRET_KEY"];
export const stripeConfigured = () => envPresent(KEYS);

let cached: { key: string; client: Stripe } | null = null;
export function stripeClient(): Stripe {
  const { STRIPE_SECRET_KEY } = requireEnv("stripe", KEYS);
  if (!cached || cached.key !== STRIPE_SECRET_KEY) cached = { key: STRIPE_SECRET_KEY, client: new Stripe(STRIPE_SECRET_KEY) };
  return cached.client;
}

export function stripeWebhookSecret(): string {
  return requireEnv("stripe", ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]).STRIPE_WEBHOOK_SECRET!;
}

const cents = (usd: number) => Math.round(usd * 100);

export async function startStripe(order: OrderForPayment, returnUrl: string): Promise<StartResult> {
  const stripe = stripeClient();
  const currency = order.currency.toLowerCase();
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((i) => ({
    quantity: i.qty,
    price_data: { currency, unit_amount: cents(i.unitPrice), product_data: { name: `${i.title} — ${i.variantTitle}` } },
  }));
  if (order.shipping > 0) {
    line_items.push({ quantity: 1, price_data: { currency, unit_amount: cents(order.shipping), product_data: { name: "الشحن" } } });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      locale: "ar",
      customer_email: order.buyerEmail,
      client_reference_id: String(order.id),
      metadata: { orderId: String(order.id) },
      success_url: `${returnUrl}?order=${order.id}&provider=stripe`,
      cancel_url: `${returnUrl}?order=${order.id}&provider=stripe&cancelled=1`,
    });
    if (!session.url) throw new ProviderRequestError("stripe", "Stripe did not return a checkout URL");
    return { providerRef: session.id, redirectUrl: session.url };
  } catch (err) {
    if (err instanceof ProviderRequestError) throw err;
    throw new ProviderRequestError("stripe", err instanceof Error ? err.message : "Stripe request failed");
  }
}

export function stripeSessionStatus(session: Stripe.Checkout.Session, expectedTotal: number): RemoteStatus {
  if (session.payment_status === "paid") {
    if (session.amount_total !== cents(expectedTotal)) return "failed"; // المبلغ لا يطابق الطلب
    return "paid";
  }
  if (session.status === "expired") return "expired";
  return "pending";
}

export async function verifyStripe(providerRef: string, expectedTotal: number): Promise<RemoteStatus> {
  try {
    const session = await stripeClient().checkout.sessions.retrieve(providerRef);
    return stripeSessionStatus(session, expectedTotal);
  } catch (err) {
    throw new ProviderRequestError("stripe", err instanceof Error ? err.message : "Stripe request failed");
  }
}
