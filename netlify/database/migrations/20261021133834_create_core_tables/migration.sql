CREATE TABLE "backgrounds" (
	"id" serial PRIMARY KEY,
	"label" text DEFAULT '',
	"blob_key" text NOT NULL,
	"mime_type" text DEFAULT 'image/jpeg' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY,
	"item_id" text NOT NULL,
	"acquired_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" integer PRIMARY KEY,
	"creature_name" text DEFAULT 'Ember' NOT NULL,
	"species" text DEFAULT 'axolotl' NOT NULL,
	"color" text DEFAULT '#b98cff' NOT NULL,
	"scene" text DEFAULT 'aurora' NOT NULL,
	"equipped" jsonb DEFAULT '[]' NOT NULL,
	"star_bank" integer DEFAULT 10 NOT NULL,
	"stars_spent" integer DEFAULT 0 NOT NULL,
	"background_id" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"subject" text DEFAULT '',
	"status" text DEFAULT 'planned' NOT NULL,
	"description" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "snapshots" (
	"id" serial PRIMARY KEY,
	"label" text DEFAULT '',
	"kind" text DEFAULT 'era' NOT NULL,
	"data" jsonb NOT NULL,
	"summary" jsonb NOT NULL,
	"notes" text DEFAULT '',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" serial PRIMARY KEY,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"minutes" integer,
	"subject" text DEFAULT '',
	"note" text DEFAULT ''
);
