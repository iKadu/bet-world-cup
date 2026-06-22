import { sql } from "drizzle-orm";
import { db } from "../index";
import { teams } from "../schema";

export interface UpsertTeamInput {
	id: string;
	name: string;
	shortName: string | null;
	tla: string | null;
	crestUrl: string | null;
	groupId: string | null;
}

export async function upsertTeams(input: UpsertTeamInput[]) {
	if (input.length === 0) return;

	await db
		.insert(teams)
		.values(input)
		.onConflictDoUpdate({
			target: teams.id,
			set: {
				name: sql`excluded.name`,
				shortName: sql`excluded.short_name`,
				tla: sql`excluded.tla`,
				crestUrl: sql`excluded.crest_url`,
				groupId: sql`excluded.group_id`,
				updatedAt: sql`now()`,
			},
		});
}
