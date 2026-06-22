import { auth } from "@world-cup/auth";
import { db } from "@world-cup/db";
import { isMatchLocked } from "@world-cup/db/lib/match-lock";
import { matches, predictions, teams } from "@world-cup/db/schema";
import { Button } from "@world-cup/ui/components/button";
import { Card, CardContent } from "@world-cup/ui/components/card";
import { TeamFlag } from "@world-cup/ui/components/flag";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { headers } from "next/headers";
import Link from "next/link";
import { getLeaderboard } from "@/lib/ranking";

const homeTeams = alias(teams, "home_teams");
const awayTeams = alias(teams, "away_teams");

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	dateStyle: "short",
	timeStyle: "short",
});

export default async function Home() {
	const session = await auth.api.getSession({ headers: await headers() });

	const allMatches = await db
		.select({ match: matches, homeTeam: homeTeams, awayTeam: awayTeams })
		.from(matches)
		.leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
		.leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
		.orderBy(matches.kickoff)
		.limit(40);

	const liveCount = allMatches.filter(
		(row) =>
			isMatchLocked(row.match) &&
			(row.match.status === "IN_PLAY" || row.match.status === "PAUSED"),
	).length;

	const myPredictions = session
		? await db
				.select()
				.from(predictions)
				.where(eq(predictions.userId, session.user.id))
		: [];
	const myPredictedMatchIds = new Set(myPredictions.map((p) => p.matchId));

	const matchesToPredict = allMatches
		.filter(
			(row) =>
				!isMatchLocked(row.match) && !myPredictedMatchIds.has(row.match.id),
		)
		.slice(0, 5);

	const leaderboard = await getLeaderboard();
	const leader = leaderboard[0];
	const myRankIndex = session
		? leaderboard.findIndex((row) => row.userId === session.user.id)
		: -1;
	const myRank = myRankIndex >= 0 ? leaderboard[myRankIndex] : undefined;

	return (
		<div>
			<section className="relative overflow-hidden border-b px-5 py-10 sm:px-7">
				<div className="pointer-events-none absolute top-0 left-0 size-96 rounded-full bg-accent-lime/10 blur-3xl" />
				<div className="relative mx-auto flex max-w-4xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<div className="mb-3 flex items-center gap-2 font-mono text-[11px] text-accent-text uppercase tracking-widest">
							<span>Copa do Mundo 2026</span>
							<span className="text-muted-foreground">·</span>
							<span className="text-muted-foreground">
								48 seleções · 12 grupos
							</span>
						</div>
						<h1 className="font-display font-extrabold text-4xl uppercase leading-tight sm:text-5xl">
							{session
								? `Bem-vindo, ${session.user.name.split(" ")[0]}.`
								: "Dê seu palpite. Suba no ranking."}
						</h1>
					</div>
					{liveCount > 0 && (
						<span className="flex shrink-0 items-center gap-2 self-start rounded-full border border-live/45 bg-live/15 px-3 py-1.5 font-mono text-[11px] text-live-foreground uppercase tracking-wide">
							<span className="size-1.5 animate-live-pulse rounded-full bg-live" />
							{liveCount}{" "}
							{liveCount === 1 ? "partida ao vivo" : "partidas ao vivo"}
						</span>
					)}
				</div>
			</section>

			<div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">
				<div className="mb-6 grid gap-4 sm:grid-cols-[1.3fr_1fr]">
					<Card>
						<CardContent>
							<p className="mb-4 font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
								Seu desempenho
							</p>
							{session ? (
								<div className="flex items-center gap-6">
									<div className="flex flex-col">
										<span className="font-bold font-mono text-5xl">
											{myRank ? `#${myRankIndex + 1}` : "—"}
										</span>
										<span className="font-mono text-[11px] text-muted-foreground">
											de {leaderboard.length}{" "}
											{leaderboard.length === 1 ? "jogador" : "jogadores"}
										</span>
									</div>
									<div className="h-12 w-px bg-border" />
									<div className="flex gap-6">
										<MiniStat
											label="Pontos"
											value={myRank?.totalPoints ?? 0}
											accent
										/>
										<MiniStat label="Exatos" value={myRank?.exactCount ?? 0} />
										<MiniStat label="Palpites" value={myPredictions.length} />
									</div>
								</div>
							) : (
								<p className="text-muted-foreground text-sm">
									<Link href="/sign-in" className="text-accent-text underline">
										Entre
									</Link>{" "}
									para ver sua pontuação e começar a palpitar.
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
							Ranking global
						</span>
						<div className="relative">
							{leader ? (
								<p className="font-display font-semibold text-lg">
									{leader.name} lidera com {leader.totalPoints} pts
								</p>
							) : (
								<p className="font-display font-semibold text-lg">
									Seja o primeiro a palpitar
								</p>
							)}
							<p className="mt-1 font-mono text-xs opacity-80">
								{myRank && leader && myRank.userId !== leader.userId
									? `Você está ${leader.totalPoints - myRank.totalPoints} pts atrás do líder`
									: "Ver tabela completa →"}
							</p>
						</div>
					</Link>
				</div>

				<section>
					<div className="mb-3 flex items-center justify-between">
						<h2 className="font-bold font-display text-lg">
							Próximos jogos sem palpite
						</h2>
						<Link
							href="/matches"
							className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide hover:text-foreground"
						>
							Ver todos
						</Link>
					</div>
					{matchesToPredict.length === 0 ? (
						<p className="rounded-lg border bg-surface-row py-8 text-center text-muted-foreground text-sm">
							Você já palpitou em todos os próximos jogos disponíveis.
						</p>
					) : (
						<div className="flex flex-col gap-2">
							{matchesToPredict.map(({ match, homeTeam, awayTeam }) => (
								<div
									key={match.id}
									className="grid grid-cols-[110px_1fr_auto_1fr_90px] items-center gap-3 rounded-lg border bg-surface-row px-4 py-3"
								>
									<span className="font-mono text-[11px] text-accent-text">
										{dateFormatter.format(match.kickoff)}
									</span>
									<span className="flex items-center justify-end gap-1.5 truncate font-display font-semibold text-sm">
										<TeamFlag tla={homeTeam?.tla} />
										<span className="truncate">
											{homeTeam?.name ?? "A definir"}
										</span>
									</span>
									<span className="font-bold font-mono text-muted-foreground text-sm">
										– : –
									</span>
									<span className="flex items-center gap-1.5 truncate font-display font-semibold text-sm">
										<span className="truncate">
											{awayTeam?.name ?? "A definir"}
										</span>
										<TeamFlag tla={awayTeam?.tla} />
									</span>
									<Button
										size="sm"
										className="justify-self-end"
										nativeButton={false}
										render={<Link href="/matches" />}
									>
										Palpitar
									</Button>
								</div>
							))}
						</div>
					)}
				</section>
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
