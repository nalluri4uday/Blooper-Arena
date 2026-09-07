CREATE TYPE "public"."ai_job_status" AS ENUM('queued', 'processing', 'completed', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."business_status" AS ENUM('starting', 'operating', 'profitable', 'struggling', 'bankrupt', 'sold');--> statement-breakpoint
CREATE TYPE "public"."decision_status" AS ENUM('pending', 'submitted', 'expired', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."season_status" AS ENUM('upcoming', 'registration', 'active', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."ledger_type" AS ENUM('starting_capital', 'salary', 'investment_gain', 'investment_loss', 'business_revenue', 'business_expense', 'partnership_income', 'negotiation_result', 'risk_event_loss', 'risk_event_gain', 'challenge_win', 'challenge_loss', 'misc_credit', 'misc_debit');--> statement-breakpoint
CREATE TYPE "public"."opportunity_state" AS ENUM('available', 'accepted', 'rejected', 'expired', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."opportunity_type" AS ENUM('job_offer', 'investment', 'partnership', 'market_event', 'business_opportunity', 'risk_event', 'skill_challenge', 'social_event');--> statement-breakpoint
CREATE TABLE "ai_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"model_tier" text DEFAULT 'cheap' NOT NULL,
	"status" "ai_job_status" DEFAULT 'queued' NOT NULL,
	"input_tokens" integer,
	"output_tokens" integer,
	"estimated_cost_microcents" integer,
	"cache_key" text,
	"result" text,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"owner_character_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"valuation" integer DEFAULT 0 NOT NULL,
	"revenue" integer DEFAULT 0 NOT NULL,
	"expenses" integer DEFAULT 0 NOT NULL,
	"status" "business_status" DEFAULT 'starting' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"attributes" jsonb NOT NULL,
	"cosmetics" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decisions" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text,
	"opportunity_id" text,
	"season_id" text NOT NULL,
	"character_id" text NOT NULL,
	"prompt" text NOT NULL,
	"options" jsonb NOT NULL,
	"selected_option" text,
	"status" "decision_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"actor_id" text NOT NULL,
	"target_id" text,
	"event_type" text NOT NULL,
	"importance" integer DEFAULT 50 NOT NULL,
	"canonical_payload" jsonb,
	"narrative_text" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friend_challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"inviter_character_id" text NOT NULL,
	"season_id" text NOT NULL,
	"token" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"accepted_character_id" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"issuer" text,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"id_token" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seasons" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"rule_version" text NOT NULL,
	"seed" text NOT NULL,
	"starting_capital" integer DEFAULT 100000 NOT NULL,
	"target_net_worth" integer DEFAULT 10000000 NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"status" "season_status" DEFAULT 'upcoming' NOT NULL,
	"max_players" integer DEFAULT 10000 NOT NULL,
	"tick_interval_minutes" integer DEFAULT 30 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "season_players" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"character_id" text NOT NULL,
	"cash" integer NOT NULL,
	"debt" integer DEFAULT 0 NOT NULL,
	"net_worth" integer NOT NULL,
	"energy" integer DEFAULT 100 NOT NULL,
	"max_energy" integer DEFAULT 100 NOT NULL,
	"reputation" integer DEFAULT 50 NOT NULL,
	"influence" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"risk_profile" real DEFAULT 0.5 NOT NULL,
	"tick_count" integer DEFAULT 0 NOT NULL,
	"last_tick_at" timestamp,
	"energy_last_replenished_at" timestamp NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"character_id" text NOT NULL,
	"type" "ledger_type" NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"reference_id" text,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"character_id" text NOT NULL,
	"type" "opportunity_type" NOT NULL,
	"state" "opportunity_state" DEFAULT 'available' NOT NULL,
	"importance" integer DEFAULT 50 NOT NULL,
	"energy_cost" integer DEFAULT 3 NOT NULL,
	"payload" jsonb,
	"expires_at" timestamp,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaderboard_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"character_id" text NOT NULL,
	"rank" integer NOT NULL,
	"previous_rank" integer,
	"net_worth" integer NOT NULL,
	"score" real NOT NULL,
	"captured_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationships" (
	"id" text PRIMARY KEY NOT NULL,
	"season_id" text NOT NULL,
	"character_a" text NOT NULL,
	"character_b" text NOT NULL,
	"strength" real DEFAULT 0 NOT NULL,
	"trust" real DEFAULT 0.5 NOT NULL,
	"rivalry" real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_missions" (
	"id" text PRIMARY KEY NOT NULL,
	"season_player_id" text NOT NULL,
	"mission_key" text NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_character_id_characters_id_fk" FOREIGN KEY ("owner_character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_actor_id_characters_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_target_id_characters_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."characters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_challenges" ADD CONSTRAINT "friend_challenges_inviter_character_id_characters_id_fk" FOREIGN KEY ("inviter_character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_challenges" ADD CONSTRAINT "friend_challenges_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_players" ADD CONSTRAINT "season_players_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_players" ADD CONSTRAINT "season_players_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "leaderboard_snapshots_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_character_a_characters_id_fk" FOREIGN KEY ("character_a") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_character_b_characters_id_fk" FOREIGN KEY ("character_b") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_missions" ADD CONSTRAINT "player_missions_season_player_id_season_players_id_fk" FOREIGN KEY ("season_player_id") REFERENCES "public"."season_players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_jobs_status_idx" ON "ai_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ai_jobs_cache_key_idx" ON "ai_jobs" USING btree ("cache_key");--> statement-breakpoint
CREATE INDEX "businesses_season_owner_idx" ON "businesses" USING btree ("season_id","owner_character_id");--> statement-breakpoint
CREATE INDEX "characters_user_id_idx" ON "characters" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "decisions_character_status_idx" ON "decisions" USING btree ("character_id","status");--> statement-breakpoint
CREATE INDEX "decisions_status_expires_idx" ON "decisions" USING btree ("status","expires_at");--> statement-breakpoint
CREATE INDEX "events_season_actor_idx" ON "events" USING btree ("season_id","actor_id");--> statement-breakpoint
CREATE INDEX "events_season_public_created_idx" ON "events" USING btree ("season_id","is_public","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "friend_challenges_token_idx" ON "friend_challenges" USING btree ("token");--> statement-breakpoint
CREATE INDEX "season_players_season_character_idx" ON "season_players" USING btree ("season_id","character_id");--> statement-breakpoint
CREATE INDEX "season_players_season_net_worth_idx" ON "season_players" USING btree ("season_id","net_worth");--> statement-breakpoint
CREATE INDEX "season_players_season_last_tick_idx" ON "season_players" USING btree ("season_id","last_tick_at");--> statement-breakpoint
CREATE INDEX "ledger_entries_season_character_idx" ON "ledger_entries" USING btree ("season_id","character_id");--> statement-breakpoint
CREATE INDEX "ledger_entries_season_character_created_idx" ON "ledger_entries" USING btree ("season_id","character_id","created_at");--> statement-breakpoint
CREATE INDEX "opportunities_season_character_idx" ON "opportunities" USING btree ("season_id","character_id");--> statement-breakpoint
CREATE INDEX "opportunities_state_expires_idx" ON "opportunities" USING btree ("state","expires_at");--> statement-breakpoint
CREATE INDEX "leaderboard_snapshots_season_captured_idx" ON "leaderboard_snapshots" USING btree ("season_id","captured_at");--> statement-breakpoint
CREATE INDEX "leaderboard_snapshots_season_captured_rank_idx" ON "leaderboard_snapshots" USING btree ("season_id","captured_at","rank");--> statement-breakpoint
CREATE INDEX "relationships_season_characters_idx" ON "relationships" USING btree ("season_id","character_a","character_b");--> statement-breakpoint
CREATE UNIQUE INDEX "player_missions_player_key_idx" ON "player_missions" USING btree ("season_player_id","mission_key");