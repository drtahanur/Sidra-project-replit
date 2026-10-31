import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db, ordersTable, paymentEventsTable } from "@workspace/db";
import { applyRemoteStatus, refreshOrder } from "../lib/orders";
import { ProviderNotConfiguredError } from "../lib/payments/types";
import { stripeClient, stripeSessionStatus, stripeWebhookSecret } from "../lib/payments/stripe";
import { cryptoWebhookSecret, verifyBtcpaySignature } from "../lib/payments/btcpay";

// يُركَّب هذا الموجّه قبل express.json() لأن التوقيع يُحسب على الجسم الخام.
const router: IRouter = Router();

const notConfigured = (res: import("express").Response, err: ProviderNotConfiguredError) =>
  res.status(503).json({ error: err.message, code: "provider_not_configured" });

router.post("/stripe", async (req, res): Promise<void> => {
  let event: Stripe.Event;
  try {
    const secret = stripeWebhookSecret();
    const signature = req.headers["stripe-signature"];
    if (typeof signature !== "string") { res.status(400).json({ error: "Missing signature" }); return; }
    event = stripeClient().webhooks.constructEvent(req.body as Buffer, signature, secret);
  } catch (err) {
    if (err instanceof ProviderNotConfiguredError) { notConfigured(res, err); return; }
    req.log.warn("Stripe webhook signature verification failed");
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  const seen = await db.select().from(paymentEventsTable).where(eq(paymentEventsTable.id, event.id));
  if (seen.length) { res.json({ received: true, duplicate: true }); return; }

  if (event.type.startsWith("checkout.session.")) {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = Number(session.metadata?.orderId);
    const [order] = Number.isInteger(orderId) ? await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)) : [];
    if (order && order.providerRef === session.id) {
      let remote = stripeSessionStatus(session, order.total);
      if (event.type === "checkout.session.async_payment_failed") remote = "failed";
      await applyRemoteStatus(order, remote);
    } else {
      req.log.warn({ type: event.type }, "Stripe webhook for unknown order");
    }
  }
  await db.insert(paymentEventsTable).values({ id: event.id, provider: "stripe" }).onConflictDoNothing();
  res.json({ received: true });
});

router.post("/btcpay", async (req, res): Promise<void> => {
  const raw = req.body as Buffer;
  try {
    const secret = cryptoWebhookSecret();
    if (!verifyBtcpaySignature(raw, req.headers["btcpay-sig"] as string | undefined, secret)) {
      res.status(400).json({ error: "Invalid signature" });
      return;
    }
  } catch (err) {
    if (err instanceof ProviderNotConfiguredError) { notConfigured(res, err); return; }
    throw err;
  }
  let payload: { invoiceId?: string; deliveryId?: string };
  try { payload = JSON.parse(raw.toString("utf8")); } catch { res.status(400).json({ error: "Invalid JSON" }); return; }
  if (!payload.invoiceId) { res.json({ received: true }); return; }

  // لا نثق بمحتوى الإشعار: نقرأ حالة الفاتورة مباشرة من BTCPay.
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.providerRef, payload.invoiceId));
  if (order) await refreshOrder(order);
  res.json({ received: true });
});

export default router;
