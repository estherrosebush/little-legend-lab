import type { Config, Context } from "@netlify/functions";
import { asc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { snapshots } from "../../db/schema.js";

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.slice(0, max) : "";
}

export default async (req: Request, context: Context) => {
  const method = req.method;

  if (method === "GET") {
    const rows = await db.select().from(snapshots).orderBy(asc(snapshots.createdAt));
    return Response.json({ snapshots: rows });
  }

  if (method === "POST") {
    const body = await req.json().catch(() => ({}));
    if (!body.data || typeof body.data !== "object" || !body.summary || typeof body.summary !== "object") {
      return Response.json({ error: "Snapshot data and summary are required" }, { status: 400 });
    }
    const kind = body.kind === "year" ? "year" : "era";
    const [row] = await db
      .insert(snapshots)
      .values({
        label: cleanText(body.label, 60),
        kind,
        data: body.data,
        summary: body.summary,
        notes: cleanText(body.notes, 2000),
      })
      .returning();
    return Response.json(row, { status: 201 });
  }

  if (method === "PATCH") {
    const id = Number(context.params.id);
    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }
    const body = await req.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};
    if (typeof body.notes === "string") {
      updates.notes = cleanText(body.notes, 2000);
    }
    if (typeof body.label === "string") {
      updates.label = cleanText(body.label, 60);
    }
    if (!Object.keys(updates).length) {
      return Response.json({ error: "Nothing to update" }, { status: 400 });
    }
    const [row] = await db.update(snapshots).set(updates).where(eq(snapshots.id, id)).returning();
    if (!row) {
      return Response.json({ error: "Snapshot not found" }, { status: 404 });
    }
    return Response.json(row);
  }

  if (method === "DELETE") {
    const id = Number(context.params.id);
    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }
    await db.delete(snapshots).where(eq(snapshots.id, id));
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/snapshots", "/api/snapshots/:id"],
};
