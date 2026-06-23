import type {
	matches as matchesTable,
	teams as teamsTable,
} from "@world-cup/db/schema";
import { Button } from "@world-cup/ui/components/button";
import { TeamFlag } from "@world-cup/ui/components/flag";
import { MatchStatusBadge } from "@world-cup/ui/components/match-status-badge";
import { cn } from "@world-cup/ui/lib/utils";
import { LockIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

type Pick = {
	matchId: string;
	homeScoreGuess: number;
	awayScoreGuess: number;
	userId: string;
	userName: string;
};

interface CompareMatchCardProps {
	match: typeof matchesTable.$inferSelect;
	homeTeam: typeof teamsTable.$inferSelect | null;
	awayTeam: typeof teamsTable.$inferSelect | null;
	locked: boolean;
	myPick: Pick | undefined;
	others: Pick[];
	dateFormatter: Intl.DateTimeFormat;
}

export async function CompareMatchCard({
	match,
	homeTeam,
	awayTeam,
	locked,
	myPick,
	others,
	dateFormatter,
}: CompareMatchCardProps) {
	const t = await getTranslations("Compare");
	const tCommon = await getTranslations("Common");

	return (
		<div className="overflow-hidden rounded-xl border bg-card">
			<div className="flex items-center justify-between gap-3 border-b bg-surface-row px-4 py-3">
				<div className="flex min-w-0 items-center justify-end gap-1.5">
					<TeamFlag tla={homeTeam?.tla} />
					<span className="truncate font-display font-semibold text-sm">
						{homeTeam?.name ?? tCommon("teamTbd")}
					</span>
				</div>
				<div className="flex shrink-0 flex-col items-center gap-1">
					{locked ? (
						<span className="font-bold font-mono text-lg tabular-nums">
							{match.homeScore ?? "–"}
							<span className="px-1 text-muted-foreground">:</span>
							{match.awayScore ?? "–"}
						</span>
					) : (
						<span className="font-mono text-[11px] text-accent-text">
							{dateFormatter.format(match.kickoff)}
						</span>
					)}
					<MatchStatusBadge status={match.status} />
				</div>
				<div className="flex min-w-0 items-center gap-1.5">
					<span className="truncate font-display font-semibold text-sm">
						{awayTeam?.name ?? tCommon("teamTbd")}
					</span>
					<TeamFlag tla={awayTeam?.tla} />
				</div>
			</div>

			<div className="px-4 py-4">
				{myPick ? (
					<div className="flex flex-col gap-1.5">
						<PickRow name={myPick.userName} pick={myPick} isYou />
						{others.length === 0 ? (
							<p className="py-3 text-center text-muted-foreground text-xs">
								{t("noOtherPicks")}
							</p>
						) : (
							others.map((pick) => (
								<PickRow key={pick.userId} name={pick.userName} pick={pick} />
							))
						)}
					</div>
				) : locked ? (
					<p className="py-4 text-center text-muted-foreground text-sm">
						{t("missedMessage")}
					</p>
				) : (
					<div className="flex flex-col items-center gap-2 py-4 text-center">
						<LockIcon className="size-5 text-muted-foreground" />
						<p className="text-muted-foreground text-sm">
							{t("lockedMessage")}
						</p>
						<Button
							size="sm"
							nativeButton={false}
							render={<Link href="/matches" />}
						>
							{t("lockedCta")}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

async function PickRow({
	name,
	pick,
	isYou = false,
}: {
	name: string;
	pick: Pick;
	isYou?: boolean;
}) {
	const t = await getTranslations("Compare");

	return (
		<div
			className={cn(
				"flex items-center justify-between gap-2 rounded-lg px-3 py-2",
				isYou && "bg-points-exact-bg",
			)}
		>
			<span className="flex items-center gap-2 truncate font-display font-semibold text-sm">
				{isYou && (
					<span className="font-mono text-[10px] text-accent-text uppercase tracking-wide">
						{t("you")}
					</span>
				)}
				<span className="truncate">{name}</span>
			</span>
			<span className="shrink-0 rounded-md border border-points-exact-border bg-points-exact-bg px-2.5 py-1 font-bold font-mono text-points-exact-text text-xs">
				{pick.homeScoreGuess}–{pick.awayScoreGuess}
			</span>
		</div>
	);
}
