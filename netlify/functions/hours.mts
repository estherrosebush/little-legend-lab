import type { Config, Context } from "@netlify/functions";
import { desc, eq, isNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { timeEntries } from "../../db/schema.js";

export default async (req: Request, context: Context) => {
  const method = req.method;

  if (method === "GET") {
    const entries = await db
      .select()
      .from(timeEntries)
      .orderBy(desc(timeEntries.startedAt))
      .limit(200);
    const [open] = await db
      .select()
      .from(timeEntries)
      .where(isNull(timeEntries.endedAt))
      .orderBy(desc(timeEntries.startedAt))
      .limit(1);
    return Response.json({ entries, open: open ?? null });
  }

  if (method === "POST") {
    const body = await req.json().catch(() => ({}));

    if (body.action === "clock-in") {
      const [open] = await db
        .select()
        .from(timeEntries)
        .where(isNull(timeEntries.endedAt))
        .limit(1);
      if (open) {
        return Response.json(
          { error: "Already clocked in", open },
          { status: 409 }
        );
      }
      const [entry] = await db
        .insert(timeEntries)
        .values({ subject: typeof body.subject === "string" ? body.subject.slice(0, 60) : "" })
        .returning();
      return Response.json(entry, { status: 201 });
    }

    if (body.action === "clock-out") {
      const [open] = await db
        .select()
        .from(timeEntries)
        .where(isNull(timeEntries.endedAt))
        .orderBy(desc(timeEntries.startedAt))
        .limit(1);
      if (!open) {
        return Response.json({ error: "Not clocked in" }, { status: 409 });
      }
      const endedAt = new Date();
      const minutes = Math.max(
        1,
        Math.round((endedAt.getTime() - new Date(open.startedAt).getTime()) / 60000)
      );
      const [entry] = await db
        .update(timeEntries)
        .set({
          endedAt,
          minutes,
          note: typeof body.note === "string" ? body.note.slice(0, 300) : "",
          subject: typeof body.subject === "string" && body.subject ? body.subject.slice(0, 60) : open.subject ?? "",
        })
        .where(eq(timeEntries.id, open.id))
        .returning();
      return Response.json(entry);
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  }

  if (method === "DELETE") {
    const id = Number(context.params.id);
    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }
    await db.delete(timeEntries).where(eq(timeEntries.id, id));
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/hours", "/api/hours/:id"],
};
