import { getServerSession } from "@world-cup/auth/server";
import {
	POINTS_CORRECT_OUTCOME,
	POINTS_EXACT_SCORE,
	POINTS_WRONG,
} from "@world-cup/db/scoring";
import { Avatar, AvatarFallback } from "@world-cup/ui/components/avatar";
import { CountUpNumber } from "@world-cup/ui/components/count-up-number";
import { PointsBadge } from "@world-cup/ui/components/points-badge";
import { cn, getInitials } from "@world-cup/ui/lib/utils";
import { TrophyIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getLeaderboard, type LeaderboardRow } from "@/lib/ranking";
import { ScrollToHighlight } from "./scroll-to-highlight";

const SCORING_ROWS = [
	{
		points: POINTS_EXACT_SCORE,
		titleKey: "scoringExact",
		descKey: "scoringExactDesc",
	},
	{
		points: POINTS_CORRECT_OUTCOME,
		titleKey: "scoringCorrect",
		descKey: "scoringCorrectDesc",
	},
	{ points: POINTS_WRONG, titleKey: "scoringMiss", descKey: "scoringMissDesc" },
] as const;

export default async function LeaderboardPage({
	searchParams,
}: {
	searchParams: Promise<{ highlight?: string }>;
}) {
	const { highlight } = await searchParams;
	const session = await getServerSession();
	const t = await getTranslations("Leaderboard");
	const rows = await getLeaderboard();
	const podium = [rows[1], rows[0], rows[2]];

	return (
		<div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">
			{highlight && <ScrollToHighlight targetId={`player-${highlight}`} />}

			<h1 className="font-display font-extrabold text-3xl">{t("title")}</h1>
			<p className="mb-6 font-mono text-muted-foreground text-xs uppercase tracking-wide">
				{t("subtitle", { count: rows.length })}
			</p>

			<div className="mb-6 rounded-xl border bg-card p-4 sm:p-5">
				<p className="mb-3 font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
					{t("scoringTitle")}
				</p>
				<div className="grid gap-3 sm:grid-cols-3">
					{SCORING_ROWS.map((row) => (
						<div key={row.titleKey} className="flex items-start gap-2.5">
							<PointsBadge points={row.points} />
							<div className="flex flex-col">
								<span className="font-display font-semibold text-sm">
									{t(row.titleKey)}
								</span>
								<span className="text-muted-foreground text-xs">
									{t(row.descKey)}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>

			{rows.length === 0 ? (
				<div className="flex flex-col items-center gap-2 rounded-lg border bg-surface-row py-10 text-center text-muted-foreground text-sm">
					<TrophyIcon className="size-6" />
					{t("empty")}
				</div>
			) : (
				<>
					{rows.length >= 2 && (
						<div className="mb-8 grid grid-cols-3 items-end gap-3 sm:gap-4">
							{podium.map((entry, index) => {
								if (!entry) return <div key={`empty-${index}`} />;
								const rank = index === 0 ? 2 : index === 1 ? 1 : 3;
								return (
									<PodiumCard
										key={entry.userId}
										entry={entry}
										rank={rank}
										emphasized={rank === 1}
										t={t}
									/>
								);
							})}
						</div>
					)}

					<div className="overflow-hidden rounded-xl border">
						<div className="hidden grid-cols-[60px_1fr_120px_120px] gap-3 border-b bg-surface-row px-5 py-2.5 font-mono text-[10px] text-muted-foreground uppercase tracking-widest sm:grid">
							<span>{t("colPosition")}</span>
							<span>{t("colPlayer")}</span>
							<span>{t("colExact")}</span>
							<span className="text-right">{t("colPoints")}</span>
						</div>
						{rows.map((row, index) => (
							<LeaderboardRowItem
								key={row.userId}
								row={row}
								position={index + 1}
								isYou={row.userId === session?.user.id}
								isHighlighted={row.userId === highlight}
								t={t}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}

type LeaderboardTranslator = Awaited<ReturnType<typeof getTranslations>>;

function PodiumCard({
	entry,
	rank,
	emphasized,
	t,
}: {
	entry: LeaderboardRow;
	rank: 1 | 2 | 3;
	emphasized: boolean;
	t: LeaderboardTranslator;
}) {
	const rankColor =
		rank === 2
			? "text-[#c8cdd6]"
			: rank === 3
				? "text-[#cd8b54]"
				: "text-accent-text";

	return (
		<div
			className={cn(
				"flex flex-col items-center gap-1.5 rounded-xl border px-2 py-4 text-center sm:gap-2 sm:px-4 sm:py-5",
				emphasized
					? "border-accent-lime/35 bg-card shadow-[0_0_0_1px_rgba(194,242,61,.1),0_20px_50px_-20px_rgba(194,242,61,.18)] sm:pb-7"
					: "border-border bg-card/60",
			)}
		>
			{emphasized && (
				<span className="font-mono text-[10px] text-accent-text uppercase tracking-widest">
					{t("leaderTag")}
				</span>
			)}
			<Avatar size={emphasized ? "lg" : "default"}>
				<AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 font-bold font-display text-primary-foreground">
					{getInitials(entry.name)}
				</AvatarFallback>
			</Avatar>
			<span className="truncate font-display font-semibold text-sm">
				{entry.name}
			</span>
			<span
				className={cn(
					"font-bold font-mono",
					emphasized
						? "text-3xl text-accent-text sm:text-4xl"
						: `text-xl sm:text-2xl ${rankColor}`,
				)}
			>
				<CountUpNumber value={entry.totalPoints} />
			</span>
			<span className="font-mono text-[11px] text-muted-foreground">
				{t("exactScoresCount", { count: entry.exactCount })}
			</span>
		</div>
	);
}

function LeaderboardRowItem({
	row,
	position,
	isYou,
	isHighlighted,
	t,
}: {
	row: LeaderboardRow;
	position: number;
	isYou: boolean;
	isHighlighted: boolean;
	t: LeaderboardTranslator;
}) {
	return (
		<div
			id={`player-${row.userId}`}
			className={cn(
				"grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 border-b px-5 py-3 last:border-b-0 sm:grid-cols-[60px_1fr_120px_120px] sm:gap-y-0",
				isYou && "bg-points-exact-bg",
				isHighlighted && "ring-2 ring-accent-lime ring-inset",
			)}
		>
			<span className="col-start-1 row-start-1 font-bold font-mono text-sm sm:col-start-auto sm:row-start-auto">
				{position}
			</span>
			<span className="col-start-2 row-start-1 flex items-center gap-2 sm:col-start-auto sm:row-start-auto">
				<Avatar size="sm">
					<AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 font-bold font-display text-[10px] text-primary-foreground">
						{getInitials(row.name)}
					</AvatarFallback>
				</Avatar>
				<span className="font-display font-semibold text-sm">{row.name}</span>
				{isYou && (
					<span className="rounded-full bg-accent-lime/15 px-2 py-0.5 font-mono text-[10px] text-accent-text uppercase">
						{t("you")}
					</span>
				)}
			</span>
			<span className="col-start-1 row-start-2 font-mono text-muted-foreground text-sm sm:col-start-auto sm:row-start-auto">
				{row.exactCount}
			</span>
			<span
				className={cn(
					"col-start-2 row-start-2 text-right font-bold font-mono text-sm sm:col-start-auto sm:row-start-auto",
					isYou && "text-accent-text",
				)}
			>
				<CountUpNumber value={row.totalPoints} />
			</span>
		</div>
	);
}
