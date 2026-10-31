import { integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const cartItemsTable = pgTable(
  "cart_items",
  {
    userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    handle: text("handle").notNull(),
    variantId: text("variant_id").notNull(),
    qty: integer("qty").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.handle, t.variantId] })],
);

export const wishlistItemsTable = pgTable(
  "wishlist_items",
  {
    userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    handle: text("handle").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.handle] })],
);
