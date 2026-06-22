import { auth } from "@world-cup/auth";
import { db } from "@world-cup/db";
import { matches, predictions, teams } from "@world-cup/db/schema";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { headers } from "next/headers";
import { MatchesView } from "./matches-view";

const homeTeams = alias(teams, "home_teams");
const awayTeams = alias(teams, "away_teams");

export default async function MatchesPage() {
	const session = await auth.api.getSession({ headers: await headers() });

	const rows = await db
		.select({ match: matches, homeTeam: homeTeams, awayTeam: awayTeams })
		.from(matches)
		.leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
		.leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
		.orderBy(matches.kickoff);

	const myPredictions = session
		? await db
				.select()
				.from(predictions)
				.where(eq(predictions.userId, session.user.id))
		: [];

	return (
		<MatchesView
			rows={rows}
			predictions={myPredictions}
			isLoggedIn={!!session}
		/>
	);
}
