ALTER TABLE "channels" ADD COLUMN "invite_code" varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_invite_code_unique" UNIQUE("invite_code");