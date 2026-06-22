import { z } from "zod";

export const matchStages = [
	"GROUP_STAGE",
	"LAST_32",
	"LAST_16",
	"QUARTER_FINALS",
	"SEMI_FINALS",
	"THIRD_PLACE",
	"FINAL",
] as const;

export const matchStatuses = [
	"SCHEDULED",
	"TIMED",
	"IN_PLAY",
	"PAUSED",
	"FINISHED",
	"POSTPONED",
	"SUSPENDED",
	"CANCELLED",
] as const;

const teamSchema = z.object({
	id: z.number().nullable(),
	name: z.string().nullable(),
	shortName: z.string().nullable(),
	tla: z.string().nullable(),
	crest: z.string().nullable(),
});

const scoreSchema = z.object({
	winner: z.enum(["HOME_TEAM", "AWAY_TEAM", "DRAW"]).nullable(),
	fullTime: z.object({
		home: z.number().nullable(),
		away: z.number().nullable(),
	}),
});

export const footballDataMatchSchema = z.object({
	id: z.number(),
	utcDate: z.string(),
	status: z.enum(matchStatuses),
	matchday: z.number().nullable(),
	stage: z.enum(matchStages),
	group: z.string().nullable(),
	homeTeam: teamSchema,
	awayTeam: teamSchema,
	score: scoreSchema,
});

export const competitionMatchesResponseSchema = z.object({
	matches: z.array(footballDataMatchSchema),
});

export type FootballDataMatch = z.infer<typeof footballDataMatchSchema>;
