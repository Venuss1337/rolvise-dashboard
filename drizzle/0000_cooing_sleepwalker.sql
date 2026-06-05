CREATE TYPE "public"."discord_guild_status" AS ENUM('linked', 'bot_missing', 'sync_required', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."managed_server_status" AS ENUM('online', 'maintenance', 'offline');--> statement-breakpoint
CREATE TYPE "public"."organization_claim_status" AS ENUM('pending', 'completed', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."organization_role" AS ENUM('Owner', 'Admin', 'Moderator');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"organization_id" uuid,
	"discord_guild_id" text,
	"actor_user_id" text,
	"actor_discord_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bot_events" (
	"event_id" uuid PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"discord_guild_id" text NOT NULL,
	"occurred_at" timestamp NOT NULL,
	"actor_discord_id" text,
	"payload" jsonb,
	"accepted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discord_guild_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"discord_guild_id" text NOT NULL,
	"name" text NOT NULL,
	"icon_url" text,
	"owner_discord_id" text NOT NULL,
	"status" "discord_guild_status" DEFAULT 'linked' NOT NULL,
	"member_count" integer,
	"linked_at" timestamp DEFAULT now() NOT NULL,
	"last_synced_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "managed_servers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" text NOT NULL,
	"image_seed" text,
	"status" "managed_server_status" DEFAULT 'offline' NOT NULL,
	"roblox_group_id" text,
	"join_code" text NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"staff_count" integer DEFAULT 0 NOT NULL,
	"active_players" integer DEFAULT 0 NOT NULL,
	"open_incidents" integer DEFAULT 0 NOT NULL,
	"last_session_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_claims" (
	"claim_token" text PRIMARY KEY NOT NULL,
	"claim_url" text NOT NULL,
	"discord_guild_id" text NOT NULL,
	"discord_guild_name" text NOT NULL,
	"guild_owner_discord_id" text NOT NULL,
	"command_user_discord_id" text NOT NULL,
	"bot_user_discord_id" text NOT NULL,
	"bot_permissions" text[] NOT NULL,
	"icon_url" text,
	"member_count" integer,
	"status" "organization_claim_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" "organization_role" NOT NULL,
	"permissions" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discord_guild_links" ADD CONSTRAINT "discord_guild_links_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "managed_servers" ADD CONSTRAINT "managed_servers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "account_provider_account_idx" ON "account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "audit_logs_organization_id_idx" ON "audit_logs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "audit_logs_discord_guild_id_idx" ON "audit_logs" USING btree ("discord_guild_id");--> statement-breakpoint
CREATE INDEX "bot_events_discord_guild_id_idx" ON "bot_events" USING btree ("discord_guild_id");--> statement-breakpoint
CREATE UNIQUE INDEX "discord_guild_links_guild_idx" ON "discord_guild_links" USING btree ("discord_guild_id");--> statement-breakpoint
CREATE UNIQUE INDEX "discord_guild_links_organization_idx" ON "discord_guild_links" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "managed_servers_organization_id_idx" ON "managed_servers" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_claims_discord_guild_id_idx" ON "organization_claims" USING btree ("discord_guild_id");--> statement-breakpoint
CREATE INDEX "organization_claims_status_idx" ON "organization_claims" USING btree ("status");--> statement-breakpoint
CREATE INDEX "organization_members_user_id_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "organization_members_organization_id_idx" ON "organization_members" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_members_user_organization_idx" ON "organization_members" USING btree ("user_id","organization_id");--> statement-breakpoint
CREATE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");