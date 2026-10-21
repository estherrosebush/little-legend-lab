import type { Config, Context } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { profile, inventory } from "../../db/schema.js";
import { ensureProfile } from "../../db/helpers.js";
import { findShopItem } from "../../src/lib/catalog.js";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.json().catch(() => ({}));
  const item = findShopItem(body.itemId);
  if (!item) {
    return Response.json({ error: "That item is not in the shop" }, { status: 400 });
  }

  const current = await ensureProfile();
  const ownedRows = await db.select().from(inventory);
  if (ownedRows.some((row) => row.itemId === item.id)) {
    return Response.json({ error: "Already owned" }, { status: 409 });
  }

  const balance = current.starBank - current.starsSpent;
  if (balance < item.price) {
    return Response.json(
      { error: `Not enough stars — you need ${item.price - balance} more` },
      { status: 400 }
    );
  }

  await db.insert(inventory).values({ itemId: item.id });
  const [row] = await db
    .update(profile)
    .set({ starsSpent: current.starsSpent + item.price, updatedAt: new Date() })
    .where(eq(profile.id, 1))
    .returning();
  const owned = await db.select().from(inventory);

  return Response.json({ profile: row, inventory: owned, purchased: item.id });
};

export const config: Config = {
  path: "/api/shop",
};
