ALTER TYPE "public"."organization_role" ADD VALUE IF NOT EXISTS 'Member';--> statement-breakpoint
CREATE TABLE "community_member_roles" (
	"member_id" uuid NOT NULL,
	"role_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"managed_server_id" uuid NOT NULL,
	"user_id" text,
	"discord_id" text NOT NULL,
	"display_name" text NOT NULL,
	"discord_username" text NOT NULL,
	"discord_avatar_url" text,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "community_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"managed_server_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#3b82f6' NOT NULL,
	"permissions" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"system_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"managed_server_id" uuid NOT NULL,
	"token" text NOT NULL,
	"role_id" uuid,
	"created_by_user_id" text NOT NULL,
	"max_uses" integer,
	"use_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dashboard_invites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "community_member_roles" ADD CONSTRAINT "community_member_roles_member_id_community_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."community_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_member_roles" ADD CONSTRAINT "community_member_roles_role_id_community_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."community_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_managed_server_id_managed_servers_id_fk" FOREIGN KEY ("managed_server_id") REFERENCES "public"."managed_servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_roles" ADD CONSTRAINT "community_roles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_roles" ADD CONSTRAINT "community_roles_managed_server_id_managed_servers_id_fk" FOREIGN KEY ("managed_server_id") REFERENCES "public"."managed_servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_invites" ADD CONSTRAINT "dashboard_invites_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_invites" ADD CONSTRAINT "dashboard_invites_managed_server_id_managed_servers_id_fk" FOREIGN KEY ("managed_server_id") REFERENCES "public"."managed_servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_invites" ADD CONSTRAINT "dashboard_invites_role_id_community_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."community_roles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_invites" ADD CONSTRAINT "dashboard_invites_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "community_member_roles_member_id_idx" ON "community_member_roles" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "community_member_roles_role_id_idx" ON "community_member_roles" USING btree ("role_id");--> statement-breakpoint
CREATE UNIQUE INDEX "community_member_roles_member_role_idx" ON "community_member_roles" USING btree ("member_id","role_id");--> statement-breakpoint
CREATE INDEX "community_members_organization_id_idx" ON "community_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "community_members_managed_server_id_idx" ON "community_members" USING btree ("managed_server_id");--> statement-breakpoint
CREATE UNIQUE INDEX "community_members_server_discord_idx" ON "community_members" USING btree ("managed_server_id","discord_id");--> statement-breakpoint
CREATE INDEX "community_roles_organization_id_idx" ON "community_roles" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "community_roles_managed_server_id_idx" ON "community_roles" USING btree ("managed_server_id");--> statement-breakpoint
CREATE UNIQUE INDEX "community_roles_server_name_idx" ON "community_roles" USING btree ("managed_server_id","name");--> statement-breakpoint
CREATE INDEX "dashboard_invites_organization_id_idx" ON "dashboard_invites" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "dashboard_invites_managed_server_id_idx" ON "dashboard_invites" USING btree ("managed_server_id");--> statement-breakpoint
CREATE UNIQUE INDEX "dashboard_invites_token_idx" ON "dashboard_invites" USING btree ("token");
