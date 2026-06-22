import { auth } from "@world-cup/auth";
import { db } from "@world-cup/db";
import { isMatchLocked } from "@world-cup/db/lib/match-lock";
import { matches, syncRuns } from "@world-cup/db/schema";
import { Card, CardContent } from "@world-cup/ui/components/card";
import { cn } from "@world-cup/ui/lib/utils";
import { desc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SyncTriggerButton } from "./sync-trigger-button";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	dateStyle: "short",
	timeStyle: "medium",
});

export default async function AdminSyncPage() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (session?.user.role !== "admin") {
		redirect("/");
	}

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
			<h1 className="font-display font-extrabold text-3xl">
				Sincronização de dados
			</h1>
			<p className="mb-6 text-muted-foreground text-sm">
				Importa times, grupos, partidas e resultados da football-data.org.
			</p>

			<div className="mb-6 grid gap-4 sm:grid-cols-[1.4fr_1fr_1fr]">
				<Card>
					<CardContent className="flex flex-col gap-3">
						<span className="flex items-center gap-2 font-mono text-[11px] text-accent-text uppercase tracking-widest">
							<span className="size-1.5 rounded-full bg-accent-lime" />
							API configurada
						</span>
						<p className="text-muted-foreground text-sm">
							{lastRun
								? `Última sync: ${dateFormatter.format(lastRun.startedAt)}`
								: "Nenhuma sincronização ainda"}
						</p>
						<SyncTriggerButton />
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
							Partidas monitoradas
						</span>
						<p className="font-bold font-mono text-4xl text-accent-text">
							{allMatches.length}
						</p>
						<p className="text-muted-foreground text-xs">
							{finishedCount} finalizadas · {liveCount} em andamento ·{" "}
							{scheduledCount} agendadas
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent>
						<span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
							Saúde das últimas execuções
						</span>
						<p className="font-bold font-mono text-4xl">{successRate}%</p>
						<p className="text-muted-foreground text-xs">
							{lastRuns.filter((r) => r.status === "SUCCESS").length} de{" "}
							{lastRuns.length} execuções com sucesso
						</p>
					</CardContent>
				</Card>
			</div>

			{runs.length === 0 ? (
				<p className="py-10 text-center text-muted-foreground text-sm">
					Nenhuma sincronização executada ainda.
				</p>
			) : (
				<div className="overflow-hidden rounded-xl border">
					<div className="grid grid-cols-[1fr_120px_110px_110px_1fr] gap-3 border-b bg-surface-row px-5 py-2.5 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
						<span>Execução</span>
						<span>Status</span>
						<span>Atualizadas</span>
						<span>Finalizadas</span>
						<span>Erro</span>
					</div>
					{runs.map((run) => (
						<div
							key={run.id}
							className="grid grid-cols-[1fr_120px_110px_110px_1fr] items-center gap-3 border-b px-5 py-3 last:border-b-0"
						>
							<span className="font-mono text-xs">
								{dateFormatter.format(run.startedAt)} · {run.triggeredBy}
							</span>
							<RunStatusBadge status={run.status} />
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

function RunStatusBadge({ status }: { status: string }) {
	const config =
		status === "SUCCESS"
			? {
					label: "Sucesso",
					className:
						"border-points-exact-border bg-points-exact-bg text-points-exact-text",
				}
			: status === "FAILED"
				? {
						label: "Falhou",
						className: "border-live/45 bg-live/15 text-live-foreground",
					}
				: {
						label: "Em execução",
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
