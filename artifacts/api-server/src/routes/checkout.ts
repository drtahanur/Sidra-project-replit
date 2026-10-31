import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { addressesTable, db, ordersTable } from "@workspace/db";
import { CapturePaypalOrderBody, CreateCheckoutBody, GetMyOrderParams } from "@workspace/api-zod";
import { currentUser, requireUser } from "../lib/auth";
import { PricingError, priceCart } from "../lib/pricing";
import { applyRemoteStatus, orderDto, refreshOrder } from "../lib/orders";
import { ProviderNotConfiguredError, ProviderRequestError, type ProviderName } from "../lib/payments/types";
import { cryptoConfigured, startCrypto } from "../lib/payments/btcpay";
import { paypalConfigured, startPaypal, capturePaypal } from "../lib/payments/paypal";
import { startStripe, stripeConfigured } from "../lib/payments/stripe";

const router: IRouter = Router();

router.get("/payments/methods", (_req, res): void => {
  res.json({ stripe: stripeConfigured(), paypal: paypalConfigured(), crypto: cryptoConfigured() });
});

const starters = { stripe: startStripe, paypal: startPaypal, crypto: startCrypto } satisfies Record<ProviderName, unknown>;

router.post("/checkout", requireUser, async (req, res): Promise<void> => {
  const parsed = CreateCheckoutBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "بيانات الطلب غير صالحة", code: "invalid_body" }); return; }
  const user = currentUser(res);
  const { provider, lines, address, saveAddress, returnUrl } = parsed.data;

  // عنوان العودة يجب أن يكون على نفس مضيف الطلب (لا نعيد توجيه العميل إلى موقع آخر).
  const host = (req.headers["x-forwarded-host"] as string | undefined)?.split(",")[0]?.trim() ?? req.headers.host;
  let returnBase: string;
  try {
    const u = new URL(returnUrl);
    if (u.host !== host) throw new Error("host mismatch");
    returnBase = `${u.origin}${u.pathname}`;
  } catch {
    res.status(400).json({ error: "عنوان العودة غير صالح", code: "invalid_return_url" });
    return;
  }

  let priced: ReturnType<typeof priceCart>;
  try { priced = priceCart(lines); } catch (err) {
    if (err instanceof PricingError) { res.status(400).json({ error: err.message, code: "invalid_cart" }); return; }
    throw err;
  }

  const shippingAddress = {
    fullName: address.fullName, phone: address.phone, country: address.country || "السعودية", city: address.city,
    line1: address.line1, line2: address.line2 ?? null, postalCode: address.postalCode ?? null,
  };

  const [order] = await db.insert(ordersTable).values({
    userId: user.id, status: "pending", paymentProvider: provider, currency: priced.currency,
    subtotal: priced.subtotal, shipping: priced.shipping, total: priced.total, items: priced.items, shippingAddress,
  }).returning();

  try {
    const start = await starters[provider]({ ...order!, buyerEmail: user.email }, returnBase);
    await db.update(ordersTable).set({ providerRef: start.providerRef }).where(eq(ordersTable.id, order!.id));
    if (saveAddress) {
      const existing = await db.select({ id: addressesTable.id }).from(addressesTable).where(eq(addressesTable.userId, user.id));
      await db.insert(addressesTable).values({ userId: user.id, label: address.label || "المنزل", ...shippingAddress, isDefault: existing.length === 0 });
    }
    res.status(201).json({ orderId: order!.id, redirectUrl: start.redirectUrl });
  } catch (err) {
    // لا يبقى طلب معلّق لم يبدأ دفعه فعليًا.
    await db.delete(ordersTable).where(eq(ordersTable.id, order!.id));
    if (err instanceof ProviderNotConfiguredError) {
      req.log.warn({ provider: err.provider, missing: err.missing }, "Payment provider not configured");
      res.status(503).json({ error: "طريقة الدفع هذه غير مفعّلة بعد في المتجر", code: "provider_not_configured" });
      return;
    }
    if (err instanceof ProviderRequestError) {
      req.log.error({ provider: err.provider, err: err.message }, "Payment provider request failed");
      res.status(502).json({ error: "تعذّر بدء عملية الدفع لدى المزوّد. حاولي مرة أخرى.", code: "provider_error" });
      return;
    }
    throw err;
  }
});

router.post("/checkout/paypal/capture", requireUser, async (req, res): Promise<void> => {
  const parsed = CapturePaypalOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "بيانات غير صالحة", code: "invalid_body" }); return; }
  const [order] = await db.select().from(ordersTable)
    .where(and(eq(ordersTable.id, parsed.data.orderId), eq(ordersTable.userId, currentUser(res).id)));
  if (!order) { res.status(404).json({ error: "الطلب غير موجود", code: "not_found" }); return; }
  if (order.paymentProvider !== "paypal" || !order.providerRef) {
    res.status(400).json({ error: "هذا الطلب ليس مدفوعًا عبر PayPal", code: "wrong_provider" });
    return;
  }
  try {
    const remote = await capturePaypal(order.providerRef, order.total, order.id);
    res.json(orderDto(await applyRemoteStatus(order, remote)));
  } catch (err) {
    if (err instanceof ProviderNotConfiguredError) { res.status(503).json({ error: "PayPal غير مفعّل بعد في المتجر", code: "provider_not_configured" }); return; }
    if (err instanceof ProviderRequestError) { req.log.error({ err: err.message }, "PayPal capture failed"); res.status(502).json({ error: "تعذّر تأكيد الدفع لدى PayPal", code: "provider_error" }); return; }
    throw err;
  }
});

router.get("/orders", requireUser, async (_req, res): Promise<void> => {
  const rows = await db.select().from(ordersTable).where(eq(ordersTable.userId, currentUser(res).id)).orderBy(ordersTable.createdAt);
  res.json(rows.reverse().map(orderDto));
});

router.get("/orders/:id", requireUser, async (req, res): Promise<void> => {
  const params = GetMyOrderParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "معرّف غير صالح", code: "invalid_params" }); return; }
  const [order] = await db.select().from(ordersTable)
    .where(and(eq(ordersTable.id, params.data.id), eq(ordersTable.userId, currentUser(res).id)));
  if (!order) { res.status(404).json({ error: "الطلب غير موجود", code: "not_found" }); return; }
  let fresh = order;
  if (order.status === "pending") {
    try { fresh = await refreshOrder(order); } catch (err) {
      // تعذّر سؤال المزوّد الآن؛ نعيد الحالة المحفوظة ويُعاد التحقق عند الطلب التالي أو عبر webhook.
      req.log.warn({ err: err instanceof Error ? err.message : String(err) }, "Order refresh failed");
    }
  }
  res.json(orderDto(fresh));
});

export default router;
