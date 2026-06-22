import { auth } from "@world-cup/auth";
import { db } from "@world-cup/db";
import { isMatchLocked } from "@world-cup/db/lib/match-lock";
import { matches, predictions, teams } from "@world-cup/db/schema";
import { Button } from "@world-cup/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@world-cup/ui/components/card";
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

	const upcomingMatches = await db
		.select({ match: matches, homeTeam: homeTeams, awayTeam: awayTeams })
		.from(matches)
		.leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
		.leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
		.orderBy(matches.kickoff)
		.limit(20);

	const myPredictedMatchIds = session
		? new Set(
				(
					await db
						.select({ matchId: predictions.matchId })
						.from(predictions)
						.where(eq(predictions.userId, session.user.id))
				).map((row) => row.matchId),
			)
		: new Set<string>();

	const matchesToPredict = upcomingMatches
		.filter(
			(row) =>
				!isMatchLocked(row.match) && !myPredictedMatchIds.has(row.match.id),
		)
		.slice(0, 5);

	let myRank: { position: number; totalPoints: number } | null = null;

	if (session) {
		const ranking = await getLeaderboard();
		const index = ranking.findIndex((row) => row.userId === session.user.id);
		const myRankRow = index >= 0 ? ranking[index] : undefined;

		if (myRankRow) {
			myRank = { position: index + 1, totalPoints: myRankRow.totalPoints };
		}
	}

	return (
		<div className="container mx-auto max-w-3xl px-4 py-6">
			<h1 className="mb-1 font-medium text-2xl">Bolão Copa 2026</h1>
			<p className="mb-6 text-muted-foreground text-sm">
				Dê seu palpite no placar de cada jogo e suba no ranking.
			</p>

			<div className="mb-6 grid gap-4 sm:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Seu desempenho</CardTitle>
					</CardHeader>
					<CardContent>
						{session ? (
							myRank ? (
								<p className="text-sm">
									Você está em <strong>{myRank.position}º</strong> lugar com{" "}
									<strong>{myRank.totalPoints}</strong> pontos.
								</p>
							) : (
								<p className="text-muted-foreground text-sm">
									Faça seu primeiro palpite para entrar no ranking.
								</p>
							)
						) : (
							<p className="text-muted-foreground text-sm">
								<Link href="/sign-in" className="underline">
									Entre
								</Link>{" "}
								para ver sua pontuação.
							</p>
						)}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Ranking</CardTitle>
					</CardHeader>
					<CardContent>
						<Button size="sm" render={<Link href="/leaderboard" />}>
							Ver ranking completo
						</Button>
					</CardContent>
				</Card>
			</div>

			<section className="rounded-lg border p-4">
				<div className="mb-2 flex items-center justify-between">
					<h2 className="font-medium">Próximos jogos sem palpite</h2>
					<Link
						href="/matches"
						className="text-muted-foreground text-xs underline"
					>
						Ver todos
					</Link>
				</div>
				{matchesToPredict.length === 0 ? (
					<p className="text-muted-foreground text-sm">
						Você já palpitou em todos os próximos jogos disponíveis.
					</p>
				) : (
					<ul className="divide-y">
						{matchesToPredict.map(({ match, homeTeam, awayTeam }) => (
							<li
								key={match.id}
								className="flex items-center justify-between py-2 text-sm"
							>
								<span>
									{homeTeam?.name ?? "A definir"} x{" "}
									{awayTeam?.name ?? "A definir"}
								</span>
								<span className="text-muted-foreground text-xs">
									{dateFormatter.format(match.kickoff)}
								</span>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
