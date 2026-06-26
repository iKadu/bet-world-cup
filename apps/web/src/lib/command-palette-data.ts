"use server";

import { db } from "@world-cup/db";
import { teams } from "@world-cup/db/schema";
import { getLeaderboard } from "@/lib/ranking";

export async function getCommandPaletteIndex() {
	const teamRows = await db
		.select({ id: teams.id, name: teams.name, tla: teams.tla })
		.from(teams)
		.orderBy(teams.name);

	const leaderboard = await getLeaderboard();

	return {
		teams: teamRows,
		players: leaderboard.map((row) => ({ id: row.userId, name: row.name })),
	};
}
