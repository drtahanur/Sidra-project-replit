import { Router, type IRouter } from "express";
import { clerkClient } from "@clerk/express";
import { and, eq } from "drizzle-orm";
import { addressesTable, cartItemsTable, db, usersTable, wishlistItemsTable } from "@workspace/db";
import { getProduct } from "@workspace/catalog";
import {
  AddMyAddressBody,
  DeleteMyAddressParams,
  SaveMyCartBody,
  SaveMyWishlistBody,
  UpdateMeBody,
} from "@workspace/api-zod";
import { currentUser, requireUser, syncUser } from "../lib/auth";

const router: IRouter = Router();
router.use("/me", requireUser);

const profileDto = (u: typeof usersTable.$inferSelect) => ({
  id: u.id, email: u.email, name: u.name, imageUrl: u.imageUrl, phone: u.phone,
  gender: u.gender, country: u.country, createdAt: u.createdAt,
});

router.get("/me", async (_req, res): Promise<void> => {
  res.json(profileDto(currentUser(res)));
});

router.post("/me/sync", async (_req, res): Promise<void> => {
  res.json(profileDto(await syncUser(currentUser(res).id)));
});

router.patch("/me", async (req, res): Promise<void> => {
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "بيانات غير صالحة", code: "invalid_body" }); return; }
  const user = currentUser(res);
  const patch: Partial<typeof usersTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) {
    const name = parsed.data.name.trim();
    const [first, ...rest] = name.split(/\s+/);
    await clerkClient.users.updateUser(user.id, { firstName: first ?? name, lastName: rest.join(" ") });
    patch.name = name;
  }
  if (parsed.data.phone !== undefined) patch.phone = parsed.data.phone?.trim() || null;
  const [row] = Object.keys(patch).length
    ? await db.update(usersTable).set(patch).where(eq(usersTable.id, user.id)).returning()
    : [user];
  res.json(profileDto(row!));
});

// السلة
const readCart = async (userId: string) => ({
  lines: (await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId)).orderBy(cartItemsTable.updatedAt))
    .map((r) => ({ handle: r.handle, variantId: r.variantId, qty: r.qty })),
});

router.get("/me/cart", async (_req, res): Promise<void> => {
  res.json(await readCart(currentUser(res).id));
});

router.put("/me/cart", async (req, res): Promise<void> => {
  const parsed = SaveMyCartBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "بيانات غير صالحة", code: "invalid_body" }); return; }
  const userId = currentUser(res).id;
  const merged = new Map<string, { handle: string; variantId: string; qty: number }>();
  for (const l of parsed.data.lines) {
    const variant = getProduct(l.handle)?.variants.find((v) => v.id === l.variantId);
    if (!variant) continue; // منتج لم يعد موجودًا في الكتالوج
    const key = `${l.handle}::${l.variantId}`;
    merged.set(key, { ...l, qty: Math.min(10, (merged.get(key)?.qty ?? 0) + l.qty) });
  }
  await db.transaction(async (tx) => {
    await tx.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
    if (merged.size) await tx.insert(cartItemsTable).values([...merged.values()].map((l) => ({ userId, ...l })));
  });
  res.json(await readCart(userId));
});

// المفضلة
const readWish = async (userId: string) => ({
  handles: (await db.select().from(wishlistItemsTable).where(eq(wishlistItemsTable.userId, userId)).orderBy(wishlistItemsTable.createdAt)).map((r) => r.handle),
});

router.get("/me/wishlist", async (_req, res): Promise<void> => {
  res.json(await readWish(currentUser(res).id));
});

router.put("/me/wishlist", async (req, res): Promise<void> => {
  const parsed = SaveMyWishlistBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "بيانات غير صالحة", code: "invalid_body" }); return; }
  const userId = currentUser(res).id;
  const handles = [...new Set(parsed.data.handles)].filter((h) => !!getProduct(h));
  await db.transaction(async (tx) => {
    await tx.delete(wishlistItemsTable).where(eq(wishlistItemsTable.userId, userId));
    if (handles.length) await tx.insert(wishlistItemsTable).values(handles.map((handle) => ({ userId, handle })));
  });
  res.json(await readWish(userId));
});

// العناوين
router.get("/me/addresses", async (_req, res): Promise<void> => {
  const rows = await db.select().from(addressesTable).where(eq(addressesTable.userId, currentUser(res).id)).orderBy(addressesTable.createdAt);
  res.json(rows.map(({ userId: _u, createdAt: _c, ...a }) => a));
});

router.post("/me/addresses", async (req, res): Promise<void> => {
  const parsed = AddMyAddressBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "بيانات العنوان غير صالحة", code: "invalid_body" }); return; }
  const userId = currentUser(res).id;
  const existing = await db.select({ id: addressesTable.id }).from(addressesTable).where(eq(addressesTable.userId, userId));
  const [row] = await db.insert(addressesTable).values({
    userId, ...parsed.data, label: parsed.data.label || "المنزل", country: parsed.data.country || "السعودية", isDefault: existing.length === 0,
  }).returning();
  const { userId: _u, createdAt: _c, ...dto } = row!;
  res.status(201).json(dto);
});

router.delete("/me/addresses/:id", async (req, res): Promise<void> => {
  const params = DeleteMyAddressParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "معرّف غير صالح", code: "invalid_params" }); return; }
  const deleted = await db.delete(addressesTable)
    .where(and(eq(addressesTable.id, params.data.id), eq(addressesTable.userId, currentUser(res).id))).returning({ id: addressesTable.id });
  if (!deleted.length) { res.status(404).json({ error: "العنوان غير موجود", code: "not_found" }); return; }
  res.sendStatus(204);
});

export default router;
