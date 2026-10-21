import type { Config } from "@netlify/functions";
import { asc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { calendarItems } from "../../db/schema.js";

const KINDS = ["event", "activity", "goal"];

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isValidDate(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export default async (req: Request, context: Context) => {
  const method = req.method;

  if (method === "GET") {
    const rows = await db.select().from(calendarItems).orderBy(asc(calendarItems.date), asc(calendarItems.time));
    return Response.json({ items: rows });
  }

  if (method === "POST") {
    const body = await req.json().catch(() => ({}));
    const title = cleanText(body.title, 120);
    const date = cleanText(body.date, 10);
    if (!title || !isValidDate(date)) {
      return Response.json({ error: "A title and a date (YYYY-MM-DD) are required" }, { status: 400 });
    }
    const [row] = await db
      .insert(calendarItems)
      .values({
        title,
        date,
        kind: KINDS.includes(body.kind) ? body.kind : "event",
        time: cleanText(body.time, 5),
        classroomId: Number.isInteger(body.classroomId) ? body.classroomId : null,
      })
      .returning();
    return Response.json(row, { status: 201 });
  }

  const id = Number(context.params.id);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  if (method === "PUT") {
    const body = await req.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};
    if (typeof body.title === "string" && body.title.trim()) updates.title = cleanText(body.title, 120);
    if (isValidDate(body.date)) updates.date = body.date;
    if (typeof body.time === "string") updates.time = cleanText(body.time, 5);
    if (KINDS.includes(body.kind)) updates.kind = body.kind;
    if (body.classroomId === null) updates.classroomId = null;
    else if (Number.isInteger(body.classroomId)) updates.classroomId = body.classroomId;
    if (body.done === "yes" || body.done === "no") updates.done = body.done;
    const [row] = await db.update(calendarItems).set(updates).where(eq(calendarItems.id, id)).returning();
    if (!row) return Response.json({ error: "Item not found" }, { status: 404 });
    return Response.json(row);
  }

  if (method === "DELETE") {
    await db.delete(calendarItems).where(eq(calendarItems.id, id));
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/calendar", "/api/calendar/:id"],
};
