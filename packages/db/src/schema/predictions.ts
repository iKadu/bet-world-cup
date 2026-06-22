import { relations, sql } from "drizzle-orm";
import {
	check,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { matches } from "./matches";

export const predictions = pgTable(
	"predictions",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		matchId: text("match_id")
			.notNull()
			.references(() => matches.id, { onDelete: "cascade" }),
		homeScoreGuess: integer("home_score_guess").notNull(),
		awayScoreGuess: integer("away_score_guess").notNull(),
		pointsEarned: integer("points_earned"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		unique("predictions_user_match_unique").on(table.userId, table.matchId),
		index("predictions_match_id_idx").on(table.matchId),
		index("predictions_user_id_idx").on(table.userId),
		check("home_score_guess_non_negative", sql`${table.homeScoreGuess} >= 0`),
		check("away_score_guess_non_negative", sql`${table.awayScoreGuess} >= 0`),
	],
);

export const predictionsRelations = relations(predictions, ({ one }) => ({
	user: one(user, {
		fields: [predictions.userId],
		references: [user.id],
	}),
	match: one(matches, {
		fields: [predictions.matchId],
		references: [matches.id],
	}),
}));
