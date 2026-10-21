import type { Config, Context } from "@netlify/functions";
import { and, asc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { classroomActivities, classroomLinks, classrooms } from "../../db/schema.js";

const EMOJI = ["📘", "➗", "🔬", "🌍", "🎨", "🎵", "🏃", "💻", "🗣️", "🧩"];

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function loadClassrooms() {
  const [rooms, links, activities] = await Promise.all([
    db.select().from(classrooms).orderBy(asc(classrooms.id)),
    db.select().from(classroomLinks).orderBy(asc(classroomLinks.id)),
    db.select().from(classroomActivities).orderBy(asc(classroomActivities.id)),
  ]);
  return rooms.map((room) => ({
    ...room,
    links: links.filter((link) => link.classroomId === room.id),
    activities: activities.filter((activity) => activity.classroomId === room.id),
  }));
}

export default async (req: Request, context: Context) => {
  const method = req.method;
  const segments = new URL(req.url).pathname
    .split("/")
    .filter(Boolean)
    .slice(1); // drop "api"

  if (segments.length === 1) {
    if (method === "GET") {
      return Response.json({ classrooms: await loadClassrooms() });
    }

    if (method === "POST") {
      const body = await req.json().catch(() => ({}));
      const name = cleanText(body.name, 60);
      if (!name) {
        return Response.json({ error: "A subject name is required" }, { status: 400 });
      }
      const emoji = EMOJI.includes(body.emoji) ? body.emoji : "📘";
      const color = /^#[0-9a-fA-F]{6}$/.test(body.color || "") ? body.color : "#b98cff";
      const [row] = await db
        .insert(classrooms)
        .values({ name, emoji, color, description: cleanText(body.description, 300) })
        .returning();
      return Response.json({ ...row, links: [], activities: [] }, { status: 201 });
    }

    return new Response("Method not allowed", { status: 405 });
  }

  const classroomId = Number(context.params.id);
  if (!Number.isInteger(classroomId)) {
    return Response.json({ error: "Invalid classroom id" }, { status: 400 });
  }
  const [room] = await db.select().from(classrooms).where(eq(classrooms.id, classroomId));
  if (!room) {
    return Response.json({ error: "Classroom not found" }, { status: 404 });
  }

  const resource = segments[2] as "links" | "activities" | undefined;
  const resourceId = context.params.resourceId ? Number(context.params.resourceId) : NaN;

  if (!resource) {
    if (method === "PUT") {
      const body = await req.json().catch(() => ({}));
      const updates: Record<string, unknown> = {};
      if (typeof body.name === "string" && body.name.trim()) updates.name = cleanText(body.name, 60);
      if (typeof body.emoji === "string" && EMOJI.includes(body.emoji)) updates.emoji = body.emoji;
      if (typeof body.color === "string" && /^#[0-9a-fA-F]{6}$/.test(body.color)) updates.color = body.color;
      if (typeof body.description === "string") updates.description = cleanText(body.description, 300);
      const [row] = await db.update(classrooms).set(updates).where(eq(classrooms.id, classroomId)).returning();
      return Response.json(row);
    }

    if (method === "DELETE") {
      await db.delete(classroomLinks).where(eq(classroomLinks.classroomId, classroomId));
      await db.delete(classroomActivities).where(eq(classroomActivities.classroomId, classroomId));
      await db.delete(classrooms).where(eq(classrooms.id, classroomId));
      return Response.json({ ok: true });
    }

    return new Response("Method not allowed", { status: 405 });
  }

  if (resource !== "links" && resource !== "activities") {
    return Response.json({ error: "Unknown resource" }, { status: 400 });
  }

  if (!Number.isInteger(resourceId)) {
    if (method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (resource === "links") {
        const label = cleanText(body.label, 80);
        let url = cleanText(body.url, 500);
        if (!label || !url) {
          return Response.json({ error: "Label and URL are required" }, { status: 400 });
        }
        if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
        const [row] = await db
          .insert(classroomLinks)
          .values({ classroomId, label, url })
          .returning();
        return Response.json(row, { status: 201 });
      }
      const title = cleanText(body.title, 120);
      if (!title) {
        return Response.json({ error: "An activity title is required" }, { status: 400 });
      }
      const [row] = await db
        .insert(classroomActivities)
        .values({ classroomId, title })
        .returning();
      return Response.json(row, { status: 201 });
    }
    return new Response("Method not allowed", { status: 405 });
  }

  if (resource === "links") {
    if (method === "DELETE") {
      await db
        .delete(classroomLinks)
        .where(and(eq(classroomLinks.id, resourceId), eq(classroomLinks.classroomId, classroomId)));
      return Response.json({ ok: true });
    }
    return new Response("Method not allowed", { status: 405 });
  }

  if (method === "PUT" || method === "DELETE") {
    const scope = and(
      eq(classroomActivities.id, resourceId),
      eq(classroomActivities.classroomId, classroomId)
    );
    if (method === "DELETE") {
      await db.delete(classroomActivities).where(scope);
      return Response.json({ ok: true });
    }
    const body = await req.json().catch(() => ({}));
    const status = body.status === "done" ? "done" : "todo";
    const [row] = await db.update(classroomActivities).set({ status }).where(scope).returning();
    if (!row) return Response.json({ error: "Activity not found" }, { status: 404 });
    return Response.json(row);
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: [
    "/api/classrooms",
    "/api/classrooms/:id",
    "/api/classrooms/:id/links",
    "/api/classrooms/:id/links/:resourceId",
    "/api/classrooms/:id/activities",
    "/api/classrooms/:id/activities/:resourceId",
  ],
};
