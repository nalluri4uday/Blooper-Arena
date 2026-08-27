import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────────────────────────────

export const aiJobStatusEnum = pgEnum("ai_job_status", [
  "queued",
  "processing",
  "completed",
  "failed",
  "skipped",
]);

// ── AI Jobs ────────────────────────────────────────────────────────────────────

export const aiJobs = pgTable(
  "ai_jobs",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    eventId: text("event_id").notNull(),
    modelTier: text("model_tier").default("cheap").notNull(),
    status: aiJobStatusEnum("status").default("queued").notNull(),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    estimatedCostMicrocents: integer("estimated_cost_microcents"),
    cacheKey: text("cache_key"),
    result: text("result"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { mode: "date" }),
  },
  (table) => [
    index("ai_jobs_status_idx").on(table.status),
    index("ai_jobs_cache_key_idx").on(table.cacheKey),
  ],
);
