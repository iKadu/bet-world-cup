"use client";

import type { ServerSession } from "@world-cup/auth/server";
import { isMatchLocked } from "@world-cup/db/lib/match-lock";
import type {
	matches as matchesTable,
	predictions as predictionsTable,
	teams as teamsTable,
} from "@world-cup/db/schema";
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
import { CalendarOffIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Topbar } from "@/components/topbar";
import { PredictionFormRow } from "./prediction-form-row";

const STAGES = [
	"GROUP_STAGE",
	"LAST_32",
	"LAST_16",
	"QUARTER_FINALS",
	"SEMI_FINALS",
	"THIRD_PLACE",
	"FINAL",
] as const;

type Stage = (typeof STAGES)[number];

const ROW_GRID =
	"grid grid-cols-3 items-center gap-x-3 gap-y-1.5 rounded-lg border bg-surface-row px-4 py-3 sm:grid-cols-[90px_1fr_auto_1fr_minmax(130px,auto)] sm:gap-4 sm:px-5 sm:py-3.5";

type MatchRow = {
	match: typeof matchesTable.$inferSelect;
	homeTeam: typeof teamsTable.$inferSelect | null;
	awayTeam: typeof teamsTable.$inferSelect | null;
};

type PredictionRow = typeof predictionsTable.$inferSelect;

interface MatchesViewProps {
	rows: MatchRow[];
	predictions: PredictionRow[];
	session: ServerSession;
}

export function MatchesView({ rows, predictions, session }: MatchesViewProps) {
	const isLoggedIn = !!session;
	const t = useTranslations("Matches");
	const tStages = useTranslations("Stages");
	const locale = useLocale();
	const router = useRouter();
	const searchParams = useSearchParams();
	const teamFilter = searchParams.get("team");
	const [stageFilter, setStageFilter] = useState<Stage | null>(null);

	const dateFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat(locale, {
				dateStyle: "short",
				timeStyle: "short",
			}),
		[locale],
	);

	const predictionsByMatchId = useMemo(
		() =>
			new Map(
				predictions.map((prediction) => [prediction.matchId, prediction]),
			),
		[predictions],
	);

	const teamFilterName = useMemo(() => {
		if (!teamFilter) return null;
		const row = rows.find(
			(item) =>
				item.homeTeam?.id === teamFilter || item.awayTeam?.id === teamFilter,
		);
		return row?.homeTeam?.id === teamFilter
			? row.homeTeam?.name
			: row?.awayTeam?.name;
	}, [rows, teamFilter]);

	const teamFilteredRows = useMemo(() => {
		return rows.filter(
			(row) =>
				!teamFilter ||
				row.homeTeam?.id === teamFilter ||
				row.awayTeam?.id === teamFilter,
		);
	}, [rows, teamFilter]);

	const filteredRows = useMemo(() => {
		return teamFilteredRows.filter(
			(row) => !stageFilter || row.match.stage === stageFilter,
		);
	}, [teamFilteredRows, stageFilter]);

	const stageCounts = useMemo(() => {
		const counts = new Map<Stage, number>();
		for (const stage of STAGES) {
			counts.set(
				stage,
				teamFilteredRows.filter((row) => row.match.stage === stage).length,
			);
		}
		return counts;
	}, [teamFilteredRows]);

	function clearTeamFilter() {
		router.push("/matches");
	}

	const upcoming = filteredRows.filter((row) => !isMatchLocked(row.match));
	const finished = filteredRows.filter(
		(row) => row.match.status === "FINISHED",
	);
	const live = filteredRows.filter(
		(row) => isMatchLocked(row.match) && row.match.status !== "FINISHED",
	);

	return (
		<div>
			<Topbar eyebrow={t("eyebrow")} title={t("title")} session={session} />

			<div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">
				{teamFilter && teamFilterName && (
					<button
						type="button"
						onClick={clearTeamFilter}
						className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 font-mono text-[11px] text-primary-foreground uppercase tracking-wide"
					>
						{t("filteredBy", { team: teamFilterName })}
						<XIcon className="size-3" />
					</button>
				)}

				<p className="mb-2 font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
					{t("roundLabel")}
				</p>
				<div className="mb-5 flex flex-wrap gap-2">
					<StageChip
						label={tStages("all")}
						count={teamFilteredRows.length}
						active={stageFilter === null}
						onClick={() => setStageFilter(null)}
					/>
					{STAGES.map((stage) => (
						<StageChip
							key={stage}
							label={tStages(stage)}
							count={stageCounts.get(stage) ?? 0}
							active={stageFilter === stage}
							onClick={() => setStageFilter(stage)}
						/>
					))}
				</div>

				<Tabs defaultValue="upcoming">
					<TabsList>
						<TabsTrigger value="upcoming" className="gap-2">
							{t("tabUpcoming")}
							<CountPill count={upcoming.length} kind="neutral" />
						</TabsTrigger>
						<TabsTrigger value="live" className="gap-2">
							{t("tabLive")}
							<CountPill count={live.length} kind="live" />
						</TabsTrigger>
						<TabsTrigger value="finished" className="gap-2">
							{t("tabFinished")}
							<CountPill count={finished.length} kind="neutral" />
						</TabsTrigger>
					</TabsList>
					<TabsContent value="upcoming" className="mt-3">
						<MatchRows
							rows={upcoming}
							predictionsByMatchId={predictionsByMatchId}
							isLoggedIn={isLoggedIn}
							editable
							dateFormatter={dateFormatter}
						/>
					</TabsContent>
					<TabsContent value="live" className="mt-3">
						<MatchRows
							rows={live}
							predictionsByMatchId={predictionsByMatchId}
							isLoggedIn={isLoggedIn}
							dateFormatter={dateFormatter}
						/>
					</TabsContent>
					<TabsContent value="finished" className="mt-3">
						<MatchRows
							rows={finished}
							predictionsByMatchId={predictionsByMatchId}
							isLoggedIn={isLoggedIn}
							dateFormatter={dateFormatter}
						/>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

function StageChip({
	label,
	count,
	active,
	onClick,
}: {
	label: string;
	count: number;
	active: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors",
				active
					? "bg-primary text-primary-foreground"
					: "bg-surface-soft text-muted-foreground hover:text-foreground",
			)}
		>
			{label}
			<span className={cn(active ? "opacity-80" : "opacity-60")}>{count}</span>
		</button>
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
	dateFormatter,
}: {
	rows: MatchRow[];
	predictionsByMatchId: Map<string, PredictionRow>;
	isLoggedIn: boolean;
	editable?: boolean;
	dateFormatter: Intl.DateTimeFormat;
}) {
	const t = useTranslations("Matches");

	if (rows.length === 0) {
		return (
			<div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground text-sm">
				<CalendarOffIcon className="size-6" />
				{t("empty")}
			</div>
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
					dateFormatter={dateFormatter}
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
	dateFormatter,
}: {
	match: typeof matchesTable.$inferSelect;
	homeTeam: typeof teamsTable.$inferSelect | null;
	awayTeam: typeof teamsTable.$inferSelect | null;
	prediction: PredictionRow | undefined;
	isLoggedIn: boolean;
	editable: boolean;
	dateFormatter: Intl.DateTimeFormat;
}) {
	const t = useTranslations("Matches");
	const tStages = useTranslations("Stages");
	const tCommon = useTranslations("Common");

	const locked = isMatchLocked(match);
	const isLive = locked && match.status !== "FINISHED";
	const showForm = editable && isLoggedIn && !locked && !prediction;

	const rowClassName = cn(
		ROW_GRID,
		isLive && "border-live/35",
		editable && prediction && "border-points-exact-border/60",
	);

	const groupCell: ReactNode = (
		<div className="col-start-1 row-start-1 flex flex-col gap-0.5 sm:col-start-auto sm:row-start-auto">
			<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
				{match.groupId
					? t("group", { id: match.groupId })
					: tStages(match.stage)}
			</span>
			<span className="font-mono text-[11px] text-accent-text">
				{dateFormatter.format(match.kickoff)}
			</span>
		</div>
	);

	const homeCell: ReactNode = (
		<div className="col-start-1 row-start-2 flex items-center justify-end gap-1.5 truncate font-display font-semibold text-sm sm:col-start-auto sm:row-start-auto">
			<TeamFlag tla={homeTeam?.tla} />
			<span className="truncate">{homeTeam?.name ?? tCommon("teamTbd")}</span>
		</div>
	);

	const awayCell: ReactNode = (
		<div className="col-start-3 row-start-2 flex items-center gap-1.5 truncate font-display font-semibold text-sm sm:col-start-auto sm:row-start-auto">
			<span className="truncate">{awayTeam?.name ?? tCommon("teamTbd")}</span>
			<TeamFlag tla={awayTeam?.tla} />
		</div>
	);

	if (showForm) {
		return (
			<PredictionFormRow
				matchId={match.id}
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
			<div className="col-start-2 row-start-2 flex h-[54px] items-center justify-center sm:col-start-auto sm:row-start-auto">
				{locked ? (
					<span className="font-bold font-mono text-2xl tabular-nums">
						{match.homeScore ?? "–"}
						<span className="px-1 text-muted-foreground">:</span>
						{match.awayScore ?? "–"}
					</span>
				) : prediction ? (
					<span className="rounded-md border border-points-exact-border bg-points-exact-bg px-2.5 py-1 font-bold font-mono text-points-exact-text text-xs">
						{prediction.homeScoreGuess}–{prediction.awayScoreGuess}
					</span>
				) : (
					<MatchStatusBadge status={match.status} />
				)}
			</div>
			{awayCell}
			<div className="col-start-3 row-start-1 flex flex-col items-end gap-1.5 sm:col-start-auto sm:row-start-auto">
				{locked && <MatchStatusBadge status={match.status} />}
				{!locked && prediction && (
					<span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
						{t("saved")}
					</span>
				)}
				{!editable &&
					(prediction ? (
						<div className="flex items-center gap-1.5">
							<span className="font-mono text-[11px] text-muted-foreground">
								{t("pick", {
									home: prediction.homeScoreGuess,
									away: prediction.awayScoreGuess,
								})}
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
						{t("signInToPredict")}
					</Link>
				)}
			</div>
		</div>
	);
}
