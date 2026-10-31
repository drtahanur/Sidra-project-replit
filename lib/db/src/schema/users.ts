import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// المعرّف هو معرّف Clerk. بيانات الحساب تُنسخ هنا عند أول طلب مسجّل لتبقى مرتبطة بباقي بيانات العميل.
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull().default(""),
  imageUrl: text("image_url"),
  phone: text("phone"),
  gender: text("gender"),
  country: text("country"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type User = typeof usersTable.$inferSelect;
