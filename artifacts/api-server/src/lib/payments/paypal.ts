import { envPresent, ProviderRequestError, requireEnv, type OrderForPayment, type RemoteStatus, type StartResult } from "./types";

const KEYS = ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"];
export const paypalConfigured = () => envPresent(KEYS);

// PAYPAL_MODE=live|sandbox. عند غيابه: live في الإنتاج وsandbox في التطوير.
function baseUrl(): string {
  const mode = process.env.PAYPAL_MODE?.trim() || (process.env.NODE_ENV === "production" ? "live" : "sandbox");
  if (mode !== "live" && mode !== "sandbox") throw new ProviderRequestError("paypal", `PAYPAL_MODE must be "live" or "sandbox"`);
  return mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

// أسعار المتجر بالدولار الأمريكي مباشرة، فلا يلزم تحويل.
export const usdAmount = (usd: number) => usd.toFixed(2);

async function accessToken(): Promise<string> {
  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = requireEnv("paypal", KEYS);
  const res = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new ProviderRequestError("paypal", `PayPal authentication failed (${res.status})`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new ProviderRequestError("paypal", "PayPal returned no access token");
  return json.access_token;
}

type PaypalLink = { rel: string; href: string };
type PaypalOrder = {
  id: string;
  status: string;
  links?: PaypalLink[];
  purchase_units?: { custom_id?: string; payments?: { captures?: { status: string; amount: { value: string; currency_code: string } }[] } }[];
};

async function paypalFetch(path: string, init: RequestInit & { requestId?: string } = {}): Promise<{ status: number; body: any }> {
  const token = await accessToken();
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.requestId ? { "PayPal-Request-Id": init.requestId } : {}),
    },
  });
  const text = await res.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
  return { status: res.status, body };
}

export async function startPaypal(order: OrderForPayment, returnUrl: string): Promise<StartResult> {
  const { status, body } = await paypalFetch("/v2/checkout/orders", {
    method: "POST",
    requestId: `sidra-order-${order.id}`,
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: String(order.id),
          description: `Sidra order #${order.id}`,
          amount: { currency_code: "USD", value: usdAmount(order.total) },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Sidra",
            locale: "ar-SA",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            return_url: `${returnUrl}?order=${order.id}&provider=paypal`,
            cancel_url: `${returnUrl}?order=${order.id}&provider=paypal&cancelled=1`,
          },
        },
      },
    }),
  });
  if (status >= 300) throw new ProviderRequestError("paypal", body?.message ?? `PayPal create order failed (${status})`);
  const created = body as PaypalOrder;
  const link = created.links?.find((l) => l.rel === "payer-action") ?? created.links?.find((l) => l.rel === "approve");
  if (!link) throw new ProviderRequestError("paypal", "PayPal did not return an approval link");
  return { providerRef: created.id, redirectUrl: link.href };
}

function statusOf(po: PaypalOrder, expectedTotal: number, localId: number): RemoteStatus {
  if (po.status === "COMPLETED") {
    const unit = po.purchase_units?.[0];
    const capture = unit?.payments?.captures?.[0];
    if (!capture || capture.status !== "COMPLETED") return "pending";
    if (unit?.custom_id !== String(localId) || capture.amount.currency_code !== "USD" || capture.amount.value !== usdAmount(expectedTotal)) return "failed";
    return "paid";
  }
  if (po.status === "VOIDED") return "failed";
  return "pending";
}

export async function verifyPaypal(providerRef: string, expectedTotal: number, localId: number): Promise<RemoteStatus> {
  const { status, body } = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(providerRef)}`);
  if (status >= 300) throw new ProviderRequestError("paypal", body?.message ?? `PayPal lookup failed (${status})`);
  return statusOf(body as PaypalOrder, expectedTotal, localId);
}

/** يلتقط المبلغ بعد موافقة العميل. آمن عند التكرار. */
export async function capturePaypal(providerRef: string, expectedTotal: number, localId: number): Promise<RemoteStatus> {
  const current = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(providerRef)}`);
  if (current.status >= 300) throw new ProviderRequestError("paypal", current.body?.message ?? `PayPal lookup failed (${current.status})`);
  const po = current.body as PaypalOrder;
  if (po.status === "APPROVED") {
    const cap = await paypalFetch(`/v2/checkout/orders/${encodeURIComponent(providerRef)}/capture`, {
      method: "POST",
      requestId: `sidra-capture-${localId}`,
      body: "{}",
    });
    if (cap.status >= 300) throw new ProviderRequestError("paypal", cap.body?.message ?? `PayPal capture failed (${cap.status})`);
    return statusOf(cap.body as PaypalOrder, expectedTotal, localId);
  }
  return statusOf(po, expectedTotal, localId);
}
