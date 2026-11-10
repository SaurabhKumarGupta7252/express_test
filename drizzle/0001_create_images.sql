CREATE TABLE "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"public_id" text NOT NULL,
	"format" varchar(16) NOT NULL,
	"bytes" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "images_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
