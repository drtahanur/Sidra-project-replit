import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export type OrderItemSnapshot = {
  handle: string;
  variantId: string;
  title: string;
  variantTitle: string;
  unitPrice: number;
  qty: number;
};

export type ShippingAddressSnapshot = {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  line1: string;
  line2?: string | null;
  postalCode?: string | null;
};

// الحالات: pending (بانتظار الدفع) · paid · failed · cancelled · expired
export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "restrict" }),
  status: text("status").notNull().default("pending"),
  paymentProvider: text("payment_provider").notNull(), // stripe | paypal | crypto
  providerRef: text("provider_ref"),                    // معرّف الجلسة/الفاتورة/الطلب لدى مزوّد الدفع
  currency: text("currency").notNull().default("USD"),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  total: integer("total").notNull(),
  items: jsonb("items").$type<OrderItemSnapshot[]>().notNull(),
  shippingAddress: jsonb("shipping_address").$type<ShippingAddressSnapshot>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

// لمنع معالجة نفس إشعار الدفع (webhook) مرتين.
export const paymentEventsTable = pgTable("payment_events", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Order = typeof ordersTable.$inferSelect;
