import { auth } from "@world-cup/auth";
import { db } from "@world-cup/db";
import { isMatchLocked } from "@world-cup/db/lib/match-lock";
import { matches, predictions, teams } from "@world-cup/db/schema";
import { TeamFlag } from "@world-cup/ui/components/flag";
import { MatchStatusBadge } from "@world-cup/ui/components/match-status-badge";
import { PointsBadge } from "@world-cup/ui/components/points-badge";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@world-cup/ui/components/tabs";
import { cn } from "@world-cup/ui/lib/utils";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { headers } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";
import { PredictionFormRow } from "./prediction-form-row";

const homeTeams = alias(teams, "home_teams");
const awayTeams = alias(teams, "away_teams");

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	dateStyle: "short",
	timeStyle: "short",
});

const STAGE_LABELS: Record<string, string> = {
	GROUP_STAGE: "Grupos",
	LAST_32: "32avos",
	LAST_16: "Oitavas",
	QUARTER_FINALS: "Quartas",
	SEMI_FINALS: "Semis",
	THIRD_PLACE: "3º lugar",
	FINAL: "Final",
};

const ROW_GRID =
	"grid grid-cols-[90px_1fr_auto_1fr_minmax(130px,auto)] items-center gap-3 rounded-lg border bg-surface-row px-4 py-3.5 sm:gap-4 sm:px-5";

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
		<div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">
			<h1 className="mb-5 font-display font-extrabold text-3xl">Partidas</h1>
			<Tabs defaultValue="upcoming">
				<TabsList>
					<TabsTrigger value="upcoming" className="gap-2">
						Próximos
						<CountPill count={upcoming.length} kind="neutral" />
					</TabsTrigger>
					<TabsTrigger value="live" className="gap-2">
						Em andamento
						<CountPill count={live.length} kind="live" />
					</TabsTrigger>
					<TabsTrigger value="finished" className="gap-2">
						Finalizados
						<CountPill count={finished.length} kind="neutral" />
					</TabsTrigger>
				</TabsList>
				<TabsContent value="upcoming" className="mt-3">
					<MatchRows
						rows={upcoming}
						predictionsByMatchId={predictionsByMatchId}
						isLoggedIn={!!session}
						editable
					/>
				</TabsContent>
				<TabsContent value="live" className="mt-3">
					<MatchRows
						rows={live}
						predictionsByMatchId={predictionsByMatchId}
						isLoggedIn={!!session}
					/>
				</TabsContent>
				<TabsContent value="finished" className="mt-3">
					<MatchRows
						rows={finished}
						predictionsByMatchId={predictionsByMatchId}
						isLoggedIn={!!session}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}

function CountPill({
	count,
	kind,
}: {
	count: number;
	kind: "neutral" | "live";
}) {
	return (
		<span
			className={cn(
				"rounded-full px-1.5 py-0.5 font-mono text-[10px]",
				kind === "live"
					? "bg-live/15 text-live-foreground"
					: "bg-foreground/8 text-muted-foreground",
			)}
		>
			{count}
		</span>
	);
}

function MatchRows({
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
			<p className="py-10 text-center text-muted-foreground text-sm">
				Nenhuma partida nesta categoria.
			</p>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{rows.map(({ match, homeTeam, awayTeam }) => (
				<MatchRowItem
					key={match.id}
					match={match}
					homeTeam={homeTeam}
					awayTeam={awayTeam}
					prediction={predictionsByMatchId.get(match.id)}
					isLoggedIn={isLoggedIn}
					editable={editable}
				/>
			))}
		</div>
	);
}

function MatchRowItem({
	match,
	homeTeam,
	awayTeam,
	prediction,
	isLoggedIn,
	editable,
}: {
	match: typeof matches.$inferSelect;
	homeTeam: typeof teams.$inferSelect | null;
	awayTeam: typeof teams.$inferSelect | null;
	prediction: PredictionRow | undefined;
	isLoggedIn: boolean;
	editable: boolean;
}) {
	const locked = isMatchLocked(match);
	const isLive = locked && match.status !== "FINISHED";
	const showForm = editable && isLoggedIn && !locked;

	const rowClassName = cn(
		ROW_GRID,
		isLive && "border-live/35",
		editable && prediction && "border-points-exact-border/60",
	);

	const groupCell: ReactNode = (
		<div className="flex flex-col gap-0.5">
			<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
				{match.groupId
					? `Grupo ${match.groupId}`
					: (STAGE_LABELS[match.stage] ?? match.stage)}
			</span>
			<span className="font-mono text-[11px] text-accent-text">
				{dateFormatter.format(match.kickoff)}
			</span>
		</div>
	);

	const homeCell: ReactNode = (
		<div className="flex items-center justify-end gap-1.5 truncate font-display font-semibold text-sm">
			<TeamFlag tla={homeTeam?.tla} />
			<span className="truncate">{homeTeam?.name ?? "A definir"}</span>
		</div>
	);

	const awayCell: ReactNode = (
		<div className="flex items-center gap-1.5 truncate font-display font-semibold text-sm">
			<span className="truncate">{awayTeam?.name ?? "A definir"}</span>
			<TeamFlag tla={awayTeam?.tla} />
		</div>
	);

	if (showForm) {
		return (
			<PredictionFormRow
				matchId={match.id}
				defaultHomeValue={prediction?.homeScoreGuess}
				defaultAwayValue={prediction?.awayScoreGuess}
				className={rowClassName}
				groupCell={groupCell}
				homeCell={homeCell}
				awayCell={awayCell}
			/>
		);
	}

	return (
		<div className={rowClassName}>
			{groupCell}
			{homeCell}
			<div className="flex h-[54px] items-center justify-center">
				{!locked ? (
					<MatchStatusBadge status={match.status} />
				) : (
					<span className="font-bold font-mono text-2xl tabular-nums">
						{match.homeScore ?? "–"}
						<span className="px-1 text-muted-foreground">:</span>
						{match.awayScore ?? "–"}
					</span>
				)}
			</div>
			{awayCell}
			<div className="flex flex-col items-end gap-1.5">
				{locked && <MatchStatusBadge status={match.status} />}
				{!editable &&
					(prediction ? (
						<div className="flex items-center gap-1.5">
							<span className="font-mono text-[11px] text-muted-foreground">
								pick {prediction.homeScoreGuess}–{prediction.awayScoreGuess}
							</span>
							<PointsBadge points={prediction.pointsEarned} />
						</div>
					) : (
						<span className="font-mono text-[11px] text-muted-foreground">
							—
						</span>
					))}
				{editable && !isLoggedIn && (
					<Link
						href="/sign-in"
						className="font-mono text-[11px] text-accent-text underline"
					>
						Entre para palpitar
					</Link>
				)}
			</div>
		</div>
	);
}
