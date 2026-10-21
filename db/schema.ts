import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const timeEntries = pgTable("time_entries", {
  id: serial().primaryKey(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  minutes: integer("minutes"),
  subject: text().default(""),
  note: text().default(""),
});

export const projects = pgTable("projects", {
  id: serial().primaryKey(),
  title: text().notNull(),
  subject: text().default(""),
  status: text().default("planned").notNull(),
  description: text().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const backgrounds = pgTable("backgrounds", {
  id: serial().primaryKey(),
  label: text().default(""),
  blobKey: text("blob_key").notNull(),
  mimeType: text("mime_type").default("image/jpeg").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const profile = pgTable("profile", {
  id: integer().primaryKey(),
  creatureName: text("creature_name").default("Ember").notNull(),
  species: text().default("axolotl").notNull(),
  color: text().default("#b98cff").notNull(),
  scene: text().default("aurora").notNull(),
  equipped: jsonb("equipped").$type<string[]>().default([]).notNull(),
  starBank: integer("star_bank").default(10).notNull(),
  starsSpent: integer("stars_spent").default(0).notNull(),
  backgroundId: integer("background_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const inventory = pgTable("inventory", {
  id: serial().primaryKey(),
  itemId: text("item_id").notNull(),
  acquiredAt: timestamp("acquired_at", { withTimezone: true }).defaultNow().notNull(),
});

export const snapshots = pgTable("snapshots", {
  id: serial().primaryKey(),
  label: text().default(""),
  kind: text().default("era").notNull(),
  data: jsonb("data").notNull(),
  summary: jsonb("summary").notNull(),
  notes: text().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
