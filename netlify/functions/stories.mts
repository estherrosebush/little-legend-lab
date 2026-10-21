import type { Config, Context } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { stories } from "../../db/schema.js";

const KINDS = ["story", "idea"];

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export default async (req: Request, context: Context) => {
  const method = req.method;

  if (method === "GET") {
    const rows = await db.select().from(stories).orderBy(desc(stories.updatedAt));
    return Response.json({ stories: rows });
  }

  if (method === "POST") {
    const body = await req.json().catch(() => ({}));
    const [row] = await db
      .insert(stories)
      .values({
        title: cleanText(body.title, 120) || "Untitled story",
        content: typeof body.content === "string" ? body.content.slice(0, 50000) : "",
        kind: KINDS.includes(body.kind) ? body.kind : "story",
      })
      .returning();
    return Response.json(row, { status: 201 });
  }

  if (method === "PUT") {
    const id = Number(context.params.id);
    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }
    const body = await req.json().catch(() => ({}));
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof body.title === "string" && body.title.trim()) {
      updates.title = cleanText(body.title, 120);
    }
    if (typeof body.content === "string") {
      updates.content = body.content.slice(0, 50000);
    }
    if (KINDS.includes(body.kind)) {
      updates.kind = body.kind;
    }
    const [row] = await db.update(stories).set(updates).where(eq(stories.id, id)).returning();
    if (!row) {
      return Response.json({ error: "Story not found" }, { status: 404 });
    }
    return Response.json(row);
  }

  if (method === "DELETE") {
    const id = Number(context.params.id);
    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }
    await db.delete(stories).where(eq(stories.id, id));
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/stories", "/api/stories/:id"],
};
