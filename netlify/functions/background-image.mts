import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { backgrounds } from "../../db/schema.js";

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const id = Number(context.params.id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const [row] = await db.select().from(backgrounds).where(eq(backgrounds.id, id)).limit(1);
  if (!row) {
    return new Response("Not found", { status: 404 });
  }

  const store = getStore("creature-backgrounds");
  const data = await store.get(row.blobKey, { type: "arrayBuffer" });
  if (!data) {
    return new Response("Image missing", { status: 404 });
  }

  return new Response(data, {
    headers: {
      "Content-Type": row.mimeType || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};

export const config: Config = {
  path: "/api/background-image/:id",
};
