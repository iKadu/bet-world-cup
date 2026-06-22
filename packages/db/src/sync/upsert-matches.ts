import { sql } from "drizzle-orm";
import { db } from "../index";
import { matches } from "../schema";
import type {
	matchStageEnum,
	matchStatusEnum,
	matchWinnerEnum,
} from "../schema/matches";

export interface UpsertMatchInput {
	id: string;
	stage: (typeof matchStageEnum.enumValues)[number];
	groupId: string | null;
	matchday: number | null;
	homeTeamId: string | null;
	awayTeamId: string | null;
	kickoff: Date;
	status: (typeof matchStatusEnum.enumValues)[number];
	homeScore: number | null;
	awayScore: number | null;
	winner: (typeof matchWinnerEnum.enumValues)[number] | null;
}

export async function upsertMatches(input: UpsertMatchInput[]) {
	if (input.length === 0) return;

	await db
		.insert(matches)
		.values(input)
		.onConflictDoUpdate({
			target: matches.id,
			set: {
				stage: sql`excluded.stage`,
				groupId: sql`excluded.group_id`,
				matchday: sql`excluded.matchday`,
				homeTeamId: sql`excluded.home_team_id`,
				awayTeamId: sql`excluded.away_team_id`,
				kickoff: sql`excluded.kickoff`,
				status: sql`excluded.status`,
				homeScore: sql`excluded.home_score`,
				awayScore: sql`excluded.away_score`,
				winner: sql`excluded.winner`,
				updatedAt: sql`now()`,
			},
		});
}
