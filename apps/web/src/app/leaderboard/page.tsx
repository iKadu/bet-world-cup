import { getServerSession } from "@world-cup/auth/server";
import {
	POINTS_CORRECT_OUTCOME,
	POINTS_EXACT_SCORE,
	POINTS_WRONG,
} from "@world-cup/db/scoring";
import { PointsBadge } from "@world-cup/ui/components/points-badge";
import { getTranslations } from "next-intl/server";
import { getLeaderboard } from "@/lib/ranking";
import { LeaderboardView } from "./leaderboard-view";

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

export default async function LeaderboardPage() {
	const session = await getServerSession();
	const t = await getTranslations("Leaderboard");
	const rows = await getLeaderboard();

	return (
		<div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">
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
				<p className="py-10 text-center text-muted-foreground text-sm">
					{t("empty")}
				</p>
			) : (
				<LeaderboardView rows={rows} currentUserId={session?.user.id} />
			)}
		</div>
	);
}
