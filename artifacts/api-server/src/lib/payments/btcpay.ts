import crypto from "node:crypto";
import { envPresent, ProviderRequestError, requireEnv, type OrderForPayment, type RemoteStatus, type StartResult } from "./types";

// BTCPay Server (مفتوح المصدر، ذاتي الاستضافة): يقبل بيتكوين ويمكن تفعيل عملات رقمية أخرى من إعدادات المتجر لديه.
const KEYS = ["BTCPAY_URL", "BTCPAY_STORE_ID", "BTCPAY_API_KEY"];
export const cryptoConfigured = () => envPresent(KEYS);

function cfg() {
  const c = requireEnv("crypto", KEYS);
  return { base: c.BTCPAY_URL!.replace(/\/+$/, ""), store: c.BTCPAY_STORE_ID!, key: c.BTCPAY_API_KEY! };
}

async function btcpay(path: string, init: RequestInit = {}): Promise<{ status: number; body: any }> {
  const { base, key } = cfg();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { Authorization: `token ${key}`, "Content-Type": "application/json" },
  });
  const text = await res.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
  return { status: res.status, body };
}

export async function startCrypto(order: OrderForPayment, returnUrl: string): Promise<StartResult> {
  const { store } = cfg();
  const { status, body } = await btcpay(`/api/v1/stores/${encodeURIComponent(store)}/invoices`, {
    method: "POST",
    body: JSON.stringify({
      amount: String(order.total),
      currency: order.currency,
      metadata: { orderId: String(order.id), buyerEmail: order.buyerEmail, itemDesc: `Sidra order #${order.id}` },
      checkout: {
        redirectURL: `${returnUrl}?order=${order.id}&provider=crypto`,
        redirectAutomatically: false,
        defaultLanguage: "ar",
      },
    }),
  });
  if (status >= 300 || !body?.id || !body?.checkoutLink) {
    throw new ProviderRequestError("crypto", body?.message ?? `BTCPay create invoice failed (${status})`);
  }
  return { providerRef: body.id as string, redirectUrl: body.checkoutLink as string };
}

export async function verifyCrypto(providerRef: string, expectedTotal: number, currency: string): Promise<RemoteStatus> {
  const { store } = cfg();
  const { status, body } = await btcpay(`/api/v1/stores/${encodeURIComponent(store)}/invoices/${encodeURIComponent(providerRef)}`);
  if (status >= 300) throw new ProviderRequestError("crypto", body?.message ?? `BTCPay lookup failed (${status})`);
  switch (body.status) {
    case "Settled":
      if (Number(body.amount) !== expectedTotal || body.currency !== currency) return "failed";
      return "paid";
    case "Expired": return "expired";
    case "Invalid": return "failed";
    default: return "pending"; // New | Processing
  }
}

export function cryptoWebhookSecret(): string {
  return requireEnv("crypto", [...KEYS, "BTCPAY_WEBHOOK_SECRET"]).BTCPAY_WEBHOOK_SECRET!;
}

/** يتحقق من توقيع BTCPay-Sig: sha256=<hmac> على الجسم الخام. */
export function verifyBtcpaySignature(raw: Buffer, header: string | undefined, secret: string): boolean {
  if (!header?.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const given = header.slice(7);
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
