import { getServerSession } from "@world-cup/auth/server";
import { db } from "@world-cup/db";
import { isMatchLocked } from "@world-cup/db/lib/match-lock";
import { matches, syncRuns } from "@world-cup/db/schema";
import { Card, CardContent } from "@world-cup/ui/components/card";
import { cn } from "@world-cup/ui/lib/utils";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { SyncTriggerButton } from "./sync-trigger-button";

export default async function AdminSyncPage() {
	const session = await getServerSession();

	if (session?.user.role !== "admin") {
		redirect("/");
	}

	const t = await getTranslations("AdminSync");
	const locale = await getLocale();
	const dateFormatter = new Intl.DateTimeFormat(locale, {
		dateStyle: "short",
		timeStyle: "medium",
	});

	const runs = await db
		.select()
		.from(syncRuns)
		.orderBy(desc(syncRuns.startedAt))
		.limit(20);

	const allMatches = await db
		.select({ status: matches.status, kickoff: matches.kickoff })
		.from(matches);

	const finishedCount = allMatches.filter(
		(m) => m.status === "FINISHED",
	).length;
	const liveCount = allMatches.filter(
		(m) => isMatchLocked(m) && m.status !== "FINISHED",
	).length;
	const scheduledCount = allMatches.length - finishedCount - liveCount;

	const lastRuns = runs.slice(0, 10);
	const successRate =
		lastRuns.length > 0
			? Math.round(
					(lastRuns.filter((r) => r.status === "SUCCESS").length /
						lastRuns.length) *
						100,
				)
			: 0;
	const lastRun = runs[0];

	return (
		<div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">
			<h1 className="font-display font-extrabold text-3xl">{t("title")}</h1>
			<p className="mb-6 text-muted-foreground text-sm">{t("subtitle")}</p>

			<div className="mb-6 grid gap-4 sm:grid-cols-[1.4fr_1fr_1fr]">
				<Card>
					<CardContent className="flex flex-col gap-3">
						<span className="flex items-center gap-2 font-mono text-[11px] text-accent-text uppercase tracking-widest">
							<span className="size-1.5 rounded-full bg-accent-lime" />
							{t("apiConfigured")}
						</span>
						<p className="text-muted-foreground text-sm">
							{lastRun
								? t("lastSync", {
										time: dateFormatter.format(lastRun.startedAt),
									})
								: t("noSyncYet")}
						</p>
						<SyncTriggerButton />
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
							{t("matchesTracked")}
						</span>
						<p className="font-bold font-mono text-4xl text-accent-text">
							{allMatches.length}
						</p>
						<p className="text-muted-foreground text-xs">
							{t("matchesBreakdown", {
								finished: finishedCount,
								live: liveCount,
								scheduled: scheduledCount,
							})}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
							{t("runHealth")}
						</span>
						<p className="font-bold font-mono text-4xl">{successRate}%</p>
						<p className="text-muted-foreground text-xs">
							{t("runHealthDetail", {
								success: lastRuns.filter((r) => r.status === "SUCCESS").length,
								total: lastRuns.length,
							})}
						</p>
					</CardContent>
				</Card>
			</div>

			{runs.length === 0 ? (
				<p className="py-10 text-center text-muted-foreground text-sm">
					{t("noRunsYet")}
				</p>
			) : (
				<div className="overflow-hidden rounded-xl border">
					<div className="grid grid-cols-[1fr_120px_110px_110px_1fr] gap-3 border-b bg-surface-row px-5 py-2.5 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
						<span>{t("colRun")}</span>
						<span>{t("colStatus")}</span>
						<span>{t("colUpdated")}</span>
						<span>{t("colFinalized")}</span>
						<span>{t("colError")}</span>
					</div>
					{runs.map((run) => (
						<div
							key={run.id}
							className="grid grid-cols-[1fr_120px_110px_110px_1fr] items-center gap-3 border-b px-5 py-3 last:border-b-0"
						>
							<span className="font-mono text-xs">
								{dateFormatter.format(run.startedAt)} · {run.triggeredBy}
							</span>
							<RunStatusBadge status={run.status} t={t} />
							<span className="font-mono text-sm">{run.matchesUpserted}</span>
							<span className="font-mono text-sm">{run.matchesFinalized}</span>
							<span className="truncate text-muted-foreground text-xs">
								{run.errorMessage ?? "—"}
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

type AdminSyncTranslator = Awaited<ReturnType<typeof getTranslations>>;

function RunStatusBadge({
	status,
	t,
}: {
	status: string;
	t: AdminSyncTranslator;
}) {
	const config =
		status === "SUCCESS"
			? {
					label: t("statusSuccess"),
					className:
						"border-points-exact-border bg-points-exact-bg text-points-exact-text",
				}
			: status === "FAILED"
				? {
						label: t("statusFailed"),
						className: "border-live/45 bg-live/15 text-live-foreground",
					}
				: {
						label: t("statusRunning"),
						className: "border-amber/40 bg-amber/15 text-amber-foreground",
					};

	return (
		<span
			className={cn(
				"inline-flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1 font-bold font-mono text-[10px] uppercase tracking-widest",
				config.className,
			)}
		>
			<span className="size-1.5 rounded-full bg-current" />
			{config.label}
		</span>
	);
}
