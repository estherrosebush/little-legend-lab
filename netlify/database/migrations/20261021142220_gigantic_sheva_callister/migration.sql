CREATE TABLE "research_projects" (
	"id" serial PRIMARY KEY,
	"topic" text DEFAULT '' NOT NULL,
	"question" text DEFAULT '' NOT NULL,
	"hypothesis" text DEFAULT '' NOT NULL,
	"findings" text DEFAULT '' NOT NULL,
	"next_steps" text DEFAULT '' NOT NULL,
	"sources" jsonb DEFAULT '[]' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" serial PRIMARY KEY,
	"title" text DEFAULT 'Untitled story' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"kind" text DEFAULT 'story' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
