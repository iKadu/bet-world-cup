import { getServerSession } from "@world-cup/auth/server";
import { db } from "@world-cup/db";
import { matches, predictions, teams } from "@world-cup/db/schema";
import { Button } from "@world-cup/ui/components/button";
import { Card, CardContent } from "@world-cup/ui/components/card";
import { TeamFlag } from "@world-cup/ui/components/flag";
import { and, count, eq, gt, inArray, notInArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { getLeaderboard } from "@/lib/ranking";

const homeTeams = alias(teams, "home_teams");
const awayTeams = alias(teams, "away_teams");

const UPCOMING_MATCHES_TO_SHOW = 3;

export default async function Home() {
	const session = await getServerSession();
	const t = await getTranslations("Dashboard");
	const tPredictions = await getTranslations("Predictions");
	const tCommon = await getTranslations("Common");
	const locale = await getLocale();
	const dateFormatter = new Intl.DateTimeFormat(locale, {
		dateStyle: "short",
		timeStyle: "short",
	});

	const myPredictions = session
		? await db
				.select()
				.from(predictions)
				.where(eq(predictions.userId, session.user.id))
		: [];
	const myPredictedMatchIds = myPredictions.map(
		(prediction) => prediction.matchId,
	);

	const matchesToPredict = await db
		.select({ match: matches, homeTeam: homeTeams, awayTeam: awayTeams })
		.from(matches)
		.leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
		.leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
		.where(
			and(
				inArray(matches.status, ["SCHEDULED", "TIMED"]),
				gt(matches.kickoff, new Date()),
				myPredictedMatchIds.length > 0
					? notInArray(matches.id, myPredictedMatchIds)
					: undefined,
			),
		)
		.orderBy(matches.kickoff)
		.limit(UPCOMING_MATCHES_TO_SHOW);

	const [{ value: liveCount }] = await db
		.select({ value: count() })
		.from(matches)
		.where(inArray(matches.status, ["IN_PLAY", "PAUSED"]));

	const leaderboard = await getLeaderboard();
	const leader = leaderboard[0];
	const myRankIndex = session
		? leaderboard.findIndex((row) => row.userId === session.user.id)
		: -1;
	const myRank = myRankIndex >= 0 ? leaderboard[myRankIndex] : undefined;

	const confidenceMatchIds = matchesToPredict.map((row) => row.match.id);
	const confidencePredictions = confidenceMatchIds.length
		? await db
				.select({
					matchId: predictions.matchId,
					homeScoreGuess: predictions.homeScoreGuess,
					awayScoreGuess: predictions.awayScoreGuess,
				})
				.from(predictions)
				.where(inArray(predictions.matchId, confidenceMatchIds))
		: [];

	function getConfidence(matchId: string) {
		const guesses = confidencePredictions.filter(
			(prediction) => prediction.matchId === matchId,
		);
		const total = guesses.length;

		if (total === 0) return null;

		const home = guesses.filter(
			(guess) => guess.homeScoreGuess > guess.awayScoreGuess,
		).length;
		const draw = guesses.filter(
			(guess) => guess.homeScoreGuess === guess.awayScoreGuess,
		).length;
		const away = total - home - draw;

		return {
			homePct: Math.round((home / total) * 100),
			drawPct: Math.round((draw / total) * 100),
			awayPct: Math.round((away / total) * 100),
		};
	}

	return (
		<div>
			<section className="relative overflow-hidden border-b px-5 py-10 sm:px-7">
				<div className="pointer-events-none absolute top-0 left-0 size-96 rounded-full bg-accent-lime/10 blur-3xl" />
				<div className="relative mx-auto flex max-w-4xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<div className="mb-3 flex items-center gap-2 font-mono text-[11px] text-accent-text uppercase tracking-widest">
							<span>{t("eyebrowTournament")}</span>
							<span className="text-muted-foreground">·</span>
							<span className="text-muted-foreground">{t("eyebrowTeams")}</span>
						</div>
						<h1 className="font-display font-extrabold text-4xl uppercase leading-tight sm:text-5xl">
							{session
								? t("welcome", { name: session.user.name.split(" ")[0] })
								: t("welcomeGuest")}
						</h1>
					</div>
					{liveCount > 0 && (
						<span className="flex shrink-0 items-center gap-2 self-start rounded-full border border-live/45 bg-live/15 px-3 py-1.5 font-mono text-[11px] text-live-foreground uppercase tracking-wide">
							<span className="size-1.5 animate-live-pulse rounded-full bg-live" />
							{t("liveMatches", { count: liveCount })}
						</span>
					)}
				</div>
			</section>

			<div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">
				<div className="mb-6 grid gap-4 sm:grid-cols-[1.3fr_1fr]">
					<Card>
						<CardContent>
							<p className="mb-4 font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
								{t("yourPerformance")}
							</p>
							{session ? (
								<div className="flex items-center gap-6">
									<div className="flex flex-col">
										<span className="font-bold font-mono text-5xl">
											{myRank ? `#${myRankIndex + 1}` : "—"}
										</span>
										<span className="font-mono text-[11px] text-muted-foreground">
											{t("ofPlayers", { count: leaderboard.length })}
										</span>
									</div>
									<div className="h-12 w-px bg-border" />
									<div className="flex gap-6">
										<MiniStat
											label={t("points")}
											value={myRank?.totalPoints ?? 0}
											accent
										/>
										<MiniStat
											label={t("exact")}
											value={myRank?.exactCount ?? 0}
										/>
										<MiniStat
											label={t("predictionsMade")}
											value={myPredictions.length}
										/>
									</div>
								</div>
							) : (
								<p className="text-muted-foreground text-sm">
									<Link href="/sign-in" className="text-accent-text underline">
										{t("signInPrompt")}
									</Link>{" "}
									{t("signInPromptSuffix")}
								</p>
							)}
						</CardContent>
					</Card>

					<Link
						href="/leaderboard"
						className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-primary px-5 py-5 text-primary-foreground transition-opacity hover:opacity-90"
					>
						<span className="pointer-events-none absolute top-1 right-2 font-display font-extrabold text-7xl opacity-10">
							01
						</span>
						<span className="relative font-mono text-[11px] uppercase tracking-widest opacity-80">
							{t("globalRanking")}
						</span>
						<div className="relative">
							{leader ? (
								<p className="font-display font-semibold text-lg">
									{t("leaderHeadline", {
										name: leader.name,
										points: leader.totalPoints,
									})}
								</p>
							) : (
								<p className="font-display font-semibold text-lg">
									{t("beTheFirst")}
								</p>
							)}
							<p className="mt-1 font-mono text-xs opacity-80">
								{myRank && leader && myRank.userId !== leader.userId
									? t("behindLeader", {
											diff: leader.totalPoints - myRank.totalPoints,
										})
									: t("viewFullTable")}
							</p>
						</div>
					</Link>
				</div>

				<section>
					<div className="mb-3 flex items-center justify-between">
						<h2 className="font-bold font-display text-lg">
							{t("predictNext")}
						</h2>
						<Link
							href="/matches"
							className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide hover:text-foreground"
						>
							{t("viewAll")}
						</Link>
					</div>
					{matchesToPredict.length === 0 ? (
						<p className="rounded-lg border bg-surface-row py-8 text-center text-muted-foreground text-sm">
							{t("allPredicted")}
						</p>
					) : (
						<div className="flex flex-col gap-2">
							{matchesToPredict.map(({ match, homeTeam, awayTeam }) => (
								<div
									key={match.id}
									className="grid grid-cols-3 items-center gap-x-3 gap-y-1.5 rounded-lg border bg-surface-row px-4 py-3 sm:grid-cols-[110px_1fr_auto_1fr_90px] sm:gap-y-0"
								>
									<span className="col-start-1 row-start-1 font-mono text-[11px] text-accent-text sm:col-start-auto sm:row-start-auto">
										{dateFormatter.format(match.kickoff)}
									</span>
									<span className="col-start-1 row-start-2 flex items-center justify-end gap-1.5 truncate font-display font-semibold text-sm sm:col-start-auto sm:row-start-auto">
										<TeamFlag tla={homeTeam?.tla} />
										<span className="truncate">
											{homeTeam?.name ?? tCommon("teamTbd")}
										</span>
									</span>
									<span className="col-start-2 row-start-2 font-bold font-mono text-muted-foreground text-sm sm:col-start-auto sm:row-start-auto">
										– : –
									</span>
									<span className="col-start-3 row-start-2 flex items-center gap-1.5 truncate font-display font-semibold text-sm sm:col-start-auto sm:row-start-auto">
										<span className="truncate">
											{awayTeam?.name ?? tCommon("teamTbd")}
										</span>
										<TeamFlag tla={awayTeam?.tla} />
									</span>
									<Button
										size="sm"
										className="col-start-3 row-start-1 justify-self-end sm:col-start-auto sm:row-start-auto"
										nativeButton={false}
										render={<Link href="/matches" />}
									>
										{t("predict")}
									</Button>
								</div>
							))}
						</div>
					)}
				</section>

				{matchesToPredict.length > 0 && (
					<section className="mt-8">
						<div className="mb-3 flex items-center justify-between">
							<h2 className="font-bold font-display text-lg">
								{t("groupConfidenceTitle")}
							</h2>
							<span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
								{t("groupConfidenceSubtitle")}
							</span>
						</div>
						<div className="flex flex-col gap-3">
							{matchesToPredict.map(({ match, homeTeam, awayTeam }) => {
								const confidence = getConfidence(match.id);

								return (
									<div
										key={match.id}
										className="rounded-lg border bg-surface-row p-4"
									>
										<div className="mb-2.5 flex items-center justify-between gap-2 font-display font-semibold text-sm">
											<span className="flex min-w-0 items-center gap-1.5">
												<TeamFlag tla={homeTeam?.tla} />
												<span className="truncate">
													{homeTeam?.name ?? tCommon("teamTbd")}
												</span>
											</span>
											<span className="shrink-0 font-mono text-[10px] text-muted-foreground uppercase">
												{tPredictions("vs")}
											</span>
											<span className="flex min-w-0 items-center justify-end gap-1.5">
												<span className="truncate">
													{awayTeam?.name ?? tCommon("teamTbd")}
												</span>
												<TeamFlag tla={awayTeam?.tla} />
											</span>
										</div>
										{confidence ? (
											<>
												<div className="flex h-2 overflow-hidden rounded-full bg-foreground/10">
													<div
														className="bg-accent-lime"
														style={{ width: `${confidence.homePct}%` }}
													/>
													<div
														className="bg-foreground/30"
														style={{ width: `${confidence.drawPct}%` }}
													/>
													<div
														className="bg-amber"
														style={{ width: `${confidence.awayPct}%` }}
													/>
												</div>
												<div className="mt-2 flex justify-between font-mono text-[11px]">
													<span className="text-accent-text">
														{t("homeWin")} {confidence.homePct}%
													</span>
													<span className="text-muted-foreground">
														{t("draw")} {confidence.drawPct}%
													</span>
													<span className="text-amber-foreground">
														{t("awayWin")} {confidence.awayPct}%
													</span>
												</div>
											</>
										) : (
											<p className="text-muted-foreground text-xs">
												{t("noPredictionsYet")}
											</p>
										)}
									</div>
								);
							})}
						</div>
					</section>
				)}
			</div>
		</div>
	);
}

function MiniStat({
	label,
	value,
	accent = false,
}: {
	label: string;
	value: number;
	accent?: boolean;
}) {
	return (
		<div className="flex flex-col">
			<span
				className={
					accent
						? "font-bold font-mono text-2xl text-accent-text"
						: "font-bold font-mono text-2xl"
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
