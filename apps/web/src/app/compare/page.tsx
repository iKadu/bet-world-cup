import { getServerSession } from "@world-cup/auth/server";
import { db } from "@world-cup/db";
import { isMatchLocked } from "@world-cup/db/lib/match-lock";
import { matches, predictions, teams, user } from "@world-cup/db/schema";
import { and, eq, gt, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { GitCompareIcon } from "lucide-react";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Topbar } from "@/components/topbar";
import { CompareMatchCard } from "./compare-match-card";

const homeTeams = alias(teams, "home_teams");
const awayTeams = alias(teams, "away_teams");

export default async function ComparePage() {
	const session = await getServerSession();

	if (!session) {
		redirect("/sign-in?redirect=/compare" as Route);
	}

	const t = await getTranslations("Compare");
	const locale = await getLocale();
	const dateFormatter = new Intl.DateTimeFormat(locale, {
		dateStyle: "short",
		timeStyle: "short",
	});

	const liveRows = await db
		.select({ match: matches, homeTeam: homeTeams, awayTeam: awayTeams })
		.from(matches)
		.leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
		.leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
		.where(inArray(matches.status, ["IN_PLAY", "PAUSED"]))
		.orderBy(matches.kickoff);

	// Multiple matches can kick off at the same time during the group stage —
	// when that happens, only pad with one upcoming match instead of two.
	const upcomingLimit = liveRows.length > 1 ? 1 : 2;

	const upcomingRows = await db
		.select({ match: matches, homeTeam: homeTeams, awayTeam: awayTeams })
		.from(matches)
		.leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
		.leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
		.where(
			and(
				inArray(matches.status, ["SCHEDULED", "TIMED"]),
				gt(matches.kickoff, new Date()),
			),
		)
		.orderBy(matches.kickoff)
		.limit(upcomingLimit);

	const rows = [...liveRows, ...upcomingRows];
	const matchIds = rows.map((row) => row.match.id);

	const allPicks = matchIds.length
		? await db
				.select({
					matchId: predictions.matchId,
					homeScoreGuess: predictions.homeScoreGuess,
					awayScoreGuess: predictions.awayScoreGuess,
					userId: predictions.userId,
					userName: user.name,
				})
				.from(predictions)
				.innerJoin(user, eq(predictions.userId, user.id))
				.where(inArray(predictions.matchId, matchIds))
				.orderBy(user.name)
		: [];

	return (
		<div>
			<Topbar eyebrow={t("eyebrow")} title={t("title")} session={session}>
				<span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
					{t("subtitle")}
				</span>
			</Topbar>

			<div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">
				{rows.length === 0 ? (
					<div className="flex flex-col items-center gap-2 rounded-lg border bg-surface-row py-10 text-center text-muted-foreground text-sm">
						<GitCompareIcon className="size-6" />
						{t("empty")}
					</div>
				) : (
					<div className="flex flex-col gap-4">
						{rows.map(({ match, homeTeam, awayTeam }) => {
							const picks = allPicks.filter(
								(pick) => pick.matchId === match.id,
							);
							const myPick = picks.find(
								(pick) => pick.userId === session.user.id,
							);
							const others = picks.filter(
								(pick) => pick.userId !== session.user.id,
							);

							return (
								<CompareMatchCard
									key={match.id}
									match={match}
									homeTeam={homeTeam}
									awayTeam={awayTeam}
									locked={isMatchLocked(match)}
									myPick={myPick}
									others={others}
									dateFormatter={dateFormatter}
								/>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
