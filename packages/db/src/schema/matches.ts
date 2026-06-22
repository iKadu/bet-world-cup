import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { groups } from "./groups";
import { teams } from "./teams";

export const matchStageEnum = pgEnum("match_stage", [
	"GROUP_STAGE",
	"LAST_32",
	"LAST_16",
	"QUARTER_FINALS",
	"SEMI_FINALS",
	"THIRD_PLACE",
	"FINAL",
]);

export const matchStatusEnum = pgEnum("match_status", [
	"SCHEDULED",
	"TIMED",
	"IN_PLAY",
	"PAUSED",
	"FINISHED",
	"POSTPONED",
	"SUSPENDED",
	"CANCELLED",
]);

export const matchWinnerEnum = pgEnum("match_winner", [
	"HOME_TEAM",
	"AWAY_TEAM",
	"DRAW",
]);

export const matches = pgTable(
	"matches",
	{
		id: text("id").primaryKey(),
		stage: matchStageEnum("stage").notNull(),
		groupId: text("group_id").references(() => groups.id),
		matchday: integer("matchday"),
		homeTeamId: text("home_team_id").references(() => teams.id),
		awayTeamId: text("away_team_id").references(() => teams.id),
		kickoff: timestamp("kickoff", { withTimezone: true }).notNull(),
		status: matchStatusEnum("status").notNull().default("SCHEDULED"),
		homeScore: integer("home_score"),
		awayScore: integer("away_score"),
		winner: matchWinnerEnum("winner"),
		pointsAwarded: boolean("points_awarded").notNull().default(false),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("matches_kickoff_idx").on(table.kickoff),
		index("matches_status_points_awarded_idx").on(
			table.status,
			table.pointsAwarded,
		),
	],
);

export const matchesRelations = relations(matches, ({ one }) => ({
	group: one(groups, {
		fields: [matches.groupId],
		references: [groups.id],
	}),
	homeTeam: one(teams, {
		fields: [matches.homeTeamId],
		references: [teams.id],
		relationName: "homeTeam",
	}),
	awayTeam: one(teams, {
		fields: [matches.awayTeamId],
		references: [teams.id],
		relationName: "awayTeam",
	}),
}));
