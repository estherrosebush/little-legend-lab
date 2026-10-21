import type { Config, Context } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { researchProjects } from "../../db/schema.js";

type Source = { title: string; url: string; note: string };

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanSources(value: unknown): Source[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 30)
    .map((item) => {
      const source = item as Partial<Source>;
      return {
        title: cleanText(source.title, 200),
        url: cleanText(source.url, 500),
        note: cleanText(source.note, 500),
      };
    })
    .filter((source) => source.title || source.url);
}

export default async (req: Request, context: Context) => {
  const method = req.method;

  if (method === "GET") {
    const rows = await db.select().from(researchProjects).orderBy(desc(researchProjects.updatedAt));
    return Response.json({ research: rows });
  }

  if (method === "POST") {
    const body = await req.json().catch(() => ({}));
    const [row] = await db
      .insert(researchProjects)
      .values({
        topic: cleanText(body.topic, 120),
        question: cleanText(body.question, 500),
        hypothesis: cleanText(body.hypothesis, 2000),
        findings: cleanText(body.findings, 5000),
        nextSteps: cleanText(body.nextSteps, 2000),
        notes: cleanText(body.notes, 5000),
        sources: cleanSources(body.sources),
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
    for (const field of ["topic", "question", "hypothesis", "findings", "nextSteps", "notes"] as const) {
      if (typeof body[field] === "string") {
        updates[field] = cleanText(body[field], field === "topic" ? 120 : field === "findings" || field === "notes" ? 5000 : 2000);
      }
    }
    if (Array.isArray(body.sources)) {
      updates.sources = cleanSources(body.sources);
    }
    const [row] = await db
      .update(researchProjects)
      .set(updates)
      .where(eq(researchProjects.id, id))
      .returning();
    if (!row) {
      return Response.json({ error: "Research project not found" }, { status: 404 });
    }
    return Response.json(row);
  }

  if (method === "DELETE") {
    const id = Number(context.params.id);
    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid id" }, { status: 400 });
    }
    await db.delete(researchProjects).where(eq(researchProjects.id, id));
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/research", "/api/research/:id"],
};
