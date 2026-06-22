import { auth } from "@world-cup/auth";
import { db } from "@world-cup/db";
import { isMatchLocked } from "@world-cup/db/lib/match-lock";
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
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@world-cup/ui/components/tabs";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { headers } from "next/headers";
import Link from "next/link";
import { PredictionForm } from "./prediction-form";

const homeTeams = alias(teams, "home_teams");
const awayTeams = alias(teams, "away_teams");

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	dateStyle: "short",
	timeStyle: "short",
});

type MatchRow = {
	match: typeof matches.$inferSelect;
	homeTeam: typeof teams.$inferSelect | null;
	awayTeam: typeof teams.$inferSelect | null;
};

type PredictionRow = typeof predictions.$inferSelect;

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

	const predictionsByMatchId = new Map(
		myPredictions.map((prediction) => [prediction.matchId, prediction]),
	);

	const upcoming = rows.filter((row) => !isMatchLocked(row.match));
	const finished = rows.filter((row) => row.match.status === "FINISHED");
	const live = rows.filter(
		(row) => isMatchLocked(row.match) && row.match.status !== "FINISHED",
	);

	return (
		<div className="container mx-auto max-w-4xl px-4 py-6">
			<h1 className="mb-4 font-medium text-lg">Partidas</h1>
			<Tabs defaultValue="upcoming">
				<TabsList>
					<TabsTrigger value="upcoming">
						Próximos ({upcoming.length})
					</TabsTrigger>
					<TabsTrigger value="live">Em andamento ({live.length})</TabsTrigger>
					<TabsTrigger value="finished">
						Finalizados ({finished.length})
					</TabsTrigger>
				</TabsList>
				<TabsContent value="upcoming">
					<MatchesTable
						rows={upcoming}
						predictionsByMatchId={predictionsByMatchId}
						isLoggedIn={!!session}
						editable
					/>
				</TabsContent>
				<TabsContent value="live">
					<MatchesTable
						rows={live}
						predictionsByMatchId={predictionsByMatchId}
						isLoggedIn={!!session}
					/>
				</TabsContent>
				<TabsContent value="finished">
					<MatchesTable
						rows={finished}
						predictionsByMatchId={predictionsByMatchId}
						isLoggedIn={!!session}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}

function MatchesTable({
	rows,
	predictionsByMatchId,
	isLoggedIn,
	editable = false,
}: {
	rows: MatchRow[];
	predictionsByMatchId: Map<string, PredictionRow>;
	isLoggedIn: boolean;
	editable?: boolean;
}) {
	if (rows.length === 0) {
		return (
			<p className="py-8 text-center text-muted-foreground text-sm">
				Nenhuma partida nesta categoria.
			</p>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Partida</TableHead>
					<TableHead>Data</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Placar</TableHead>
					<TableHead>Seu palpite</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{rows.map(({ match, homeTeam, awayTeam }) => {
					const prediction = predictionsByMatchId.get(match.id);

					return (
						<TableRow key={match.id}>
							<TableCell>
								{homeTeam?.name ?? "A definir"} x{" "}
								{awayTeam?.name ?? "A definir"}
							</TableCell>
							<TableCell>{dateFormatter.format(match.kickoff)}</TableCell>
							<TableCell>
								<MatchStatusBadge status={match.status} />
							</TableCell>
							<TableCell>
								{match.homeScore !== null && match.awayScore !== null
									? `${match.homeScore} x ${match.awayScore}`
									: "—"}
							</TableCell>
							<TableCell>
								{editable && isLoggedIn ? (
									<PredictionForm
										matchId={match.id}
										defaultHomeValue={prediction?.homeScoreGuess}
										defaultAwayValue={prediction?.awayScoreGuess}
									/>
								) : editable ? (
									<Link href="/sign-in" className="text-xs underline">
										Entre para palpitar
									</Link>
								) : prediction ? (
									<span>
										{prediction.homeScoreGuess} x {prediction.awayScoreGuess}
										{prediction.pointsEarned !== null
											? ` (${prediction.pointsEarned} pts)`
											: ""}
									</span>
								) : (
									"—"
								)}
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
