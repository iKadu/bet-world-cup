import { getServerSession } from "@world-cup/auth/server";
import { db } from "@world-cup/db";
import { matches, predictions, teams } from "@world-cup/db/schema";
import { POINTS_EXACT_SCORE } from "@world-cup/db/scoring";
import { TeamFlag } from "@world-cup/ui/components/flag";
import { MatchStatusBadge } from "@world-cup/ui/components/match-status-badge";
import { PointsBadge } from "@world-cup/ui/components/points-badge";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

const homeTeams = alias(teams, "home_teams");
const awayTeams = alias(teams, "away_teams");

export default async function PredictionsPage() {
	const session = await getServerSession();

	if (!session) {
		redirect("/sign-in?redirect=/predictions" as Route);
	}

	const t = await getTranslations("Predictions");
	const tStages = await getTranslations("Stages");
	const tCommon = await getTranslations("Common");

	const rows = await db
		.select({
			prediction: predictions,
			match: matches,
			homeTeam: homeTeams,
			awayTeam: awayTeams,
		})
		.from(predictions)
		.innerJoin(matches, eq(predictions.matchId, matches.id))
		.leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
		.leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
		.where(eq(predictions.userId, session.user.id))
		.orderBy(matches.kickoff);

	const totalPoints = rows.reduce(
		(sum, row) => sum + (row.prediction.pointsEarned ?? 0),
		0,
	);
	const exactCount = rows.filter(
		(row) => row.prediction.pointsEarned === POINTS_EXACT_SCORE,
	).length;
	const scoredRows = rows.filter((row) => row.prediction.pointsEarned !== null);
	const hitRate =
		scoredRows.length > 0
			? Math.round(
					(scoredRows.filter((row) => (row.prediction.pointsEarned ?? 0) > 0)
						.length /
						scoredRows.length) *
						100,
				)
			: 0;

	return (
		<div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">
			<div className="relative mb-6 overflow-hidden rounded-xl border bg-card px-5 py-6 sm:px-7">
				<div className="pointer-events-none absolute top-0 left-0 size-64 rounded-full bg-accent-lime/10 blur-3xl" />
				<div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
					<h1 className="font-display font-extrabold text-3xl">{t("title")}</h1>
					<div className="flex gap-6">
						<Stat label={t("points")} value={totalPoints} highlight />
						<Stat label={t("exactScores")} value={exactCount} />
						<Stat label={t("hitRate")} value={`${hitRate}%`} />
					</div>
				</div>
			</div>

			{rows.length === 0 ? (
				<p className="py-10 text-center text-muted-foreground text-sm">
					{t("empty")}
				</p>
			) : (
				<div className="overflow-hidden rounded-xl border">
					<div className="hidden grid-cols-[100px_1fr_110px_110px_110px_90px] gap-3 border-b bg-surface-row px-5 py-2.5 font-mono text-[10px] text-muted-foreground uppercase tracking-widest sm:grid">
						<span>{t("colGroup")}</span>
						<span>{t("colMatch")}</span>
						<span>{t("colYourPick")}</span>
						<span>{t("colResult")}</span>
						<span>{t("colStatus")}</span>
						<span className="text-right">{t("colPoints")}</span>
					</div>
					{rows.map(({ prediction, match, homeTeam, awayTeam }) => (
						<div
							key={prediction.id}
							className="grid grid-cols-3 items-center gap-x-3 gap-y-1.5 border-b px-5 py-3 last:border-b-0 sm:grid-cols-[100px_1fr_110px_110px_110px_90px] sm:gap-y-0 sm:py-3.5"
						>
							<span className="col-start-1 row-start-1 font-mono text-[11px] text-muted-foreground sm:col-start-auto sm:row-start-auto">
								{match.groupId ?? tStages(match.stage)}
							</span>
							<span className="col-span-3 row-start-2 flex items-center gap-1.5 truncate font-display font-semibold text-sm sm:col-span-1 sm:col-start-auto sm:row-start-auto">
								<TeamFlag tla={homeTeam?.tla} />
								<span className="truncate">
									{homeTeam?.name ?? tCommon("teamTbd")}
								</span>
								<span className="text-muted-foreground">{t("vs")}</span>
								<span className="truncate">
									{awayTeam?.name ?? tCommon("teamTbd")}
								</span>
								<TeamFlag tla={awayTeam?.tla} />
							</span>
							<span className="col-start-1 row-start-3 font-bold font-mono text-base sm:col-start-auto sm:row-start-auto">
								{prediction.homeScoreGuess}–{prediction.awayScoreGuess}
							</span>
							<span className="col-start-2 row-start-3 font-bold font-mono text-base text-foreground/70 sm:col-start-auto sm:row-start-auto">
								{match.homeScore !== null && match.awayScore !== null
									? `${match.homeScore}–${match.awayScore}`
									: "–"}
							</span>
							<span className="col-start-3 row-start-1 sm:col-start-auto sm:row-start-auto">
								<MatchStatusBadge status={match.status} />
							</span>
							<span className="col-start-3 row-start-3 flex justify-end sm:col-start-auto sm:row-start-auto">
								<PointsBadge points={prediction.pointsEarned} />
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function Stat({
	label,
	value,
	highlight = false,
}: {
	label: string;
	value: string | number;
	highlight?: boolean;
}) {
	return (
		<div className="flex flex-col items-end gap-0.5">
			<span
				className={
					highlight
						? "font-bold font-mono text-3xl text-accent-text"
						: "font-bold font-mono text-3xl"
				}
			>
				{value}
			</span>
			<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
				{label}
			</span>
		</div>
	);
}
