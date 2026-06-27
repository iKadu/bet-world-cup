import type { ServerSession } from "@world-cup/auth/server";
import { db } from "@world-cup/db";
import { matches, predictions, teams } from "@world-cup/db/schema";
import { count, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getLeaderboard } from "@/lib/ranking";

const homeTeams = alias(teams, "sidebar_home_teams");
const awayTeams = alias(teams, "sidebar_away_teams");

export interface SidebarLiveMatch {
	id: string;
	homeTeamName: string;
	awayTeamName: string;
}

export interface SidebarData {
	matchesCount: number;
	predictionsCount: number;
	liveMatches: SidebarLiveMatch[];
	userRank: number | null;
	userPoints: number;
}

export async function getSidebarData(
	session: ServerSession,
): Promise<SidebarData> {
	const [{ value: matchesCount }] = await db
		.select({ value: count() })
		.from(matches);

	const liveRows = await db
		.select({
			id: matches.id,
			homeTeamName: homeTeams.name,
			awayTeamName: awayTeams.name,
		})
		.from(matches)
		.leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
		.leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
		.where(inArray(matches.status, ["IN_PLAY", "PAUSED"]))
		.orderBy(matches.kickoff);

	const liveMatches: SidebarLiveMatch[] = liveRows.map((row) => ({
		id: row.id,
		homeTeamName: row.homeTeamName ?? "TBD",
		awayTeamName: row.awayTeamName ?? "TBD",
	}));

	if (!session) {
		return {
			matchesCount,
			predictionsCount: 0,
			liveMatches,
			userRank: null,
			userPoints: 0,
		};
	}

	const [{ value: predictionsCount }] = await db
		.select({ value: count() })
		.from(predictions)
		.where(eq(predictions.userId, session.user.id));

	const leaderboard = await getLeaderboard();
	const rankIndex = leaderboard.findIndex(
		(row) => row.userId === session.user.id,
	);
	const userRow = rankIndex >= 0 ? leaderboard[rankIndex] : undefined;

	return {
		matchesCount,
		predictionsCount,
		liveMatches,
		userRank: rankIndex >= 0 ? rankIndex + 1 : null,
		userPoints: userRow?.totalPoints ?? 0,
	};
}
