CREATE TABLE "calendar_items" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"kind" text DEFAULT 'event' NOT NULL,
	"date" text NOT NULL,
	"time" text DEFAULT '',
	"classroom_id" integer,
	"done" text DEFAULT 'no' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classroom_activities" (
	"id" serial PRIMARY KEY,
	"classroom_id" integer NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'todo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classroom_links" (
	"id" serial PRIMARY KEY,
	"classroom_id" integer NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classrooms" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"emoji" text DEFAULT '📘' NOT NULL,
	"color" text DEFAULT '#b98cff' NOT NULL,
	"description" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calendar_items" ADD CONSTRAINT "calendar_items_classroom_id_classrooms_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "classroom_activities" ADD CONSTRAINT "classroom_activities_classroom_id_classrooms_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "classroom_links" ADD CONSTRAINT "classroom_links_classroom_id_classrooms_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("id") ON DELETE CASCADE;