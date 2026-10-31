import type { RequestHandler } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, usersTable, type User } from "@workspace/db";

async function readClerkProfile(userId: string) {
  const u = await clerkClient.users.getUser(userId);
  const email = u.primaryEmailAddress?.emailAddress ?? u.emailAddresses[0]?.emailAddress ?? "";
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.username || "";
  const metadata = u.unsafeMetadata as { gender?: unknown; countryCode?: unknown; phone?: unknown };
  const gender = metadata.gender === "male" || metadata.gender === "female" ? metadata.gender : null;
  const country = typeof metadata.countryCode === "string" ? metadata.countryCode : null;
  const phone = typeof metadata.phone === "string" ? metadata.phone : null;
  return { email, name, imageUrl: u.hasImage ? u.imageUrl : null, phone, gender, country };
}

/** يعيد صف المستخدم المحلي، وينشئه من بيانات Clerk عند أول زيارة. */
export async function ensureUser(userId: string): Promise<User> {
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (existing) return existing;
  const profile = await readClerkProfile(userId);
  const [row] = await db.insert(usersTable).values({ id: userId, ...profile }).onConflictDoNothing().returning();
  if (row) return row;
  const [again] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  return again!;
}

/** يعيد قراءة الاسم والبريد والصورة من Clerk ويحفظها في قاعدة البيانات الداخلية. */
export async function syncUser(userId: string): Promise<User> {
  await ensureUser(userId);
  const profile = await readClerkProfile(userId);
  const [row] = await db.update(usersTable).set(profile).where(eq(usersTable.id, userId)).returning();
  return row!;
}

export const requireUser: RequestHandler = async (req, res, next): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "يجب تسجيل الدخول أولًا", code: "unauthorized" });
    return;
  }
  res.locals.user = await ensureUser(userId);
  next();
};

export const currentUser = (res: { locals: Record<string, unknown> }) => res.locals.user as User;
