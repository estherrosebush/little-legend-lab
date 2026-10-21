import type { Config, Context } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { getStore } from "@netlify/blobs";
import { db } from "../../db/index.js";
import { backgrounds, profile } from "../../db/schema.js";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export default async (req: Request, context: Context) => {
  const method = req.method;

  if (method === "GET") {
    if (context.params.id) {
      return Response.json({ error: "Use /api/background-image/:id to view an image" }, { status: 404 });
    }
    const rows = await db.select().from(backgrounds).orderBy(desc(backgrounds.createdAt));
    return Response.json({ backgrounds: rows });
  }

  if (method === "POST") {
    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!file || typeof file === "string" || typeof (file as File).arrayBuffer !== "function") {
      return Response.json({ error: "Please choose an image file" }, { status: 400 });
    }
    const image = file as File;
    if (!ALLOWED.has(image.type)) {
      return Response.json({ error: "Only JPEG, PNG, or WebP images are supported" }, { status: 400 });
    }
    if (image.size > MAX_BYTES) {
      return Response.json({ error: "Image is too large (5 MB max)" }, { status: 400 });
    }

    const ext = image.type === "image/png" ? "png" : image.type === "image/webp" ? "webp" : "jpg";
    const key = `bg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const store = getStore("creature-backgrounds");
    await store.set(key, image);

    const label = typeof form?.get("label") === "string" ? (form.get("label") as string).slice(0, 60) : "";
    const [row] = await db
      .insert(backgrounds)
      .values({ label, blobKey: key, mimeType: image.type })
      .returning();
    return Response.json(row, { status: 201 });
  }

  if (method === "DELETE") {
    const id = Number(context.params.id);
    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }
    const [row] = await db.select().from(backgrounds).where(eq(backgrounds.id, id)).limit(1);
    if (row) {
      const store = getStore("creature-backgrounds");
      await store.delete(row.blobKey);
      await db.delete(backgrounds).where(eq(backgrounds.id, id));
      const [current] = await db.select().from(profile).where(eq(profile.id, 1)).limit(1);
      if (current?.backgroundId === id) {
        await db.update(profile).set({ backgroundId: null }).where(eq(profile.id, 1));
      }
    }
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/backgrounds", "/api/backgrounds/:id"],
};
