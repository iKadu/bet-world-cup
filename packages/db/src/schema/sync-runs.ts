import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const syncTriggerEnum = pgEnum("sync_trigger", ["CRON", "MANUAL"]);

export const syncStatusEnum = pgEnum("sync_status", [
	"RUNNING",
	"SUCCESS",
	"FAILED",
]);

export const syncRuns = pgTable("sync_runs", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	triggeredBy: syncTriggerEnum("triggered_by").notNull(),
	triggeredByUserId: text("triggered_by_user_id").references(() => user.id),
	status: syncStatusEnum("status").notNull().default("RUNNING"),
	matchesUpserted: integer("matches_upserted").notNull().default(0),
	matchesFinalized: integer("matches_finalized").notNull().default(0),
	errorMessage: text("error_message"),
	startedAt: timestamp("started_at").notNull().defaultNow(),
	finishedAt: timestamp("finished_at"),
});

export const syncRunsRelations = relations(syncRuns, ({ one }) => ({
	triggeredByUser: one(user, {
		fields: [syncRuns.triggeredByUserId],
		references: [user.id],
	}),
}));
