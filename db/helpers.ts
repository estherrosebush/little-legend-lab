import { eq } from "drizzle-orm";
import { db } from "./index.js";
import { profile } from "./schema.js";

export async function ensureProfile() {
  const [existing] = await db.select().from(profile).where(eq(profile.id, 1));
  if (existing) return existing;

  const [created] = await db
    .insert(profile)
    .values({ id: 1 })
    .onConflictDoNothing()
    .returning();
  if (created) return created;

  const [fallback] = await db.select().from(profile).where(eq(profile.id, 1));
  return fallback;
}
