import { auth } from "@world-cup/auth";
import { db } from "@world-cup/db";
import { matches, predictions, teams } from "@world-cup/db/schema";
import { MatchStatusBadge } from "@world-cup/ui/components/match-status-badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@world-cup/ui/components/table";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const homeTeams = alias(teams, "home_teams");
const awayTeams = alias(teams, "away_teams");

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	dateStyle: "short",
	timeStyle: "short",
});

export default async function PredictionsPage() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session) {
		redirect("/sign-in?redirect=/predictions" as Route);
	}

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

	return (
		<div className="container mx-auto max-w-3xl px-4 py-6">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-medium text-lg">Minhas previsões</h1>
				<p className="text-muted-foreground text-sm">
					Total: {totalPoints} pts
				</p>
			</div>
			{rows.length === 0 ? (
				<p className="py-8 text-center text-muted-foreground text-sm">
					Você ainda não fez nenhum palpite.
				</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Partida</TableHead>
							<TableHead>Data</TableHead>
							<TableHead>Seu palpite</TableHead>
							<TableHead>Resultado</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Pontos</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map(({ prediction, match, homeTeam, awayTeam }) => (
							<TableRow key={prediction.id}>
								<TableCell>
									{homeTeam?.name ?? "A definir"} x{" "}
									{awayTeam?.name ?? "A definir"}
								</TableCell>
								<TableCell>{dateFormatter.format(match.kickoff)}</TableCell>
								<TableCell>
									{prediction.homeScoreGuess} x {prediction.awayScoreGuess}
								</TableCell>
								<TableCell>
									{match.homeScore !== null && match.awayScore !== null
										? `${match.homeScore} x ${match.awayScore}`
										: "—"}
								</TableCell>
								<TableCell>
									<MatchStatusBadge status={match.status} />
								</TableCell>
								<TableCell>
									{prediction.pointsEarned !== null
										? `${prediction.pointsEarned} pts`
										: "—"}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
