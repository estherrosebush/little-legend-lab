import type { Config, Context } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { projects } from "../../db/schema.js";

const STATUSES = ["planned", "active", "done"];

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export default async (req: Request, context: Context) => {
  const method = req.method;

  if (method === "GET") {
    const rows = await db.select().from(projects).orderBy(desc(projects.createdAt));
    return Response.json({ projects: rows });
  }

  if (method === "POST") {
    const body = await req.json().catch(() => ({}));
    const title = cleanText(body.title, 80);
    if (!title) {
      return Response.json({ error: "A project title is required" }, { status: 400 });
    }
    const [row] = await db
      .insert(projects)
      .values({
        title,
        subject: cleanText(body.subject, 40),
        description: cleanText(body.description, 1000),
        status: STATUSES.includes(body.status) ? body.status : "planned",
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
      updates.title = cleanText(body.title, 80);
    }
    if (typeof body.subject === "string") {
      updates.subject = cleanText(body.subject, 40);
    }
    if (typeof body.description === "string") {
      updates.description = cleanText(body.description, 1000);
    }
    if (STATUSES.includes(body.status)) {
      updates.status = body.status;
    }
    const [row] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    if (!row) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }
    return Response.json(row);
  }

  if (method === "DELETE") {
    const id = Number(context.params.id);
    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }
    await db.delete(projects).where(eq(projects.id, id));
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/projects", "/api/projects/:id"],
};
