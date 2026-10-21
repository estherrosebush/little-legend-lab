import type { Config, Context } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { profile, inventory, backgrounds } from "../../db/schema.js";
import { ensureProfile } from "../../db/helpers.js";
import { isColorValid, isSpeciesValid, SHOP_ITEMS, SCENES } from "../../src/lib/catalog.js";

export default async (req: Request, context: Context) => {
  if (req.method === "GET") {
    const row = await ensureProfile();
    const ownedRows = await db.select().from(inventory);
    return Response.json({ profile: row, owned: ownedRows.map((item) => item.itemId) });
  }

  if (req.method === "PATCH") {
    const body = await req.json().catch(() => ({}));
    const current = await ensureProfile();
    const action = body.action;

    if (action === "creature") {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (typeof body.creatureName === "string" && body.creatureName.trim()) {
        updates.creatureName = body.creatureName.trim().slice(0, 40);
      }
      if (isSpeciesValid(body.species)) {
        updates.species = body.species;
      }
      if (isColorValid(body.color)) {
        updates.color = body.color;
      }
      if (SCENES.some((scene) => scene.id === body.scene)) {
        updates.scene = body.scene;
      }
      const [row] = await db.update(profile).set(updates).where(eq(profile.id, 1)).returning();
      return Response.json({ profile: row });
    }

    if (action === "equip") {
      const ownedRows = await db.select().from(inventory);
      const owned = new Set(ownedRows.map((row) => row.itemId));
      const catalogIds = new Set(SHOP_ITEMS.map((item) => item.id));
      const equipped = Array.isArray(body.equipped)
        ? body.equipped.filter((id: unknown) => typeof id === "string" && catalogIds.has(id) && owned.has(id))
        : [];
      const [row] = await db
        .update(profile)
        .set({ equipped, updatedAt: new Date() })
        .where(eq(profile.id, 1))
        .returning();
      return Response.json({ profile: row });
    }

    if (action === "background") {
      let backgroundId: number | null = null;
      if (typeof body.backgroundId === "number" && Number.isInteger(body.backgroundId)) {
        const [row] = await db
          .select()
          .from(backgrounds)
          .where(eq(backgrounds.id, body.backgroundId))
          .limit(1);
        if (!row) {
          return Response.json({ error: "Background not found" }, { status: 404 });
        }
        backgroundId = row.id;
      }
      const [updated] = await db
        .update(profile)
        .set({ backgroundId, updatedAt: new Date() })
        .where(eq(profile.id, 1))
        .returning();
      return Response.json({ profile: updated });
    }

    if (action === "grant") {
      const amount = Math.round(Number(body.amount));
      if (!Number.isFinite(amount) || amount === 0) {
        return Response.json({ error: "Amount must be a non-zero number" }, { status: 400 });
      }
      const starBank = Math.max(0, current.starBank + amount);
      const [row] = await db
        .update(profile)
        .set({ starBank, updatedAt: new Date() })
        .where(eq(profile.id, 1))
        .returning();
      return Response.json({ profile: row, granted: row.starBank - current.starBank });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/profile",
};
