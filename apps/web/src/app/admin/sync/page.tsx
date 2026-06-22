import { auth } from "@world-cup/auth";
import { db } from "@world-cup/db";
import { syncRuns } from "@world-cup/db/schema";
import { Badge } from "@world-cup/ui/components/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@world-cup/ui/components/table";
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

	return (
		<div className="container mx-auto max-w-3xl px-4 py-6">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-medium text-lg">Sincronização de partidas</h1>
				<SyncTriggerButton />
			</div>
			{runs.length === 0 ? (
				<p className="py-8 text-center text-muted-foreground text-sm">
					Nenhuma sincronização executada ainda.
				</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Início</TableHead>
							<TableHead>Disparado por</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Atualizadas</TableHead>
							<TableHead>Finalizadas</TableHead>
							<TableHead>Erro</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{runs.map((run) => (
							<TableRow key={run.id}>
								<TableCell>{dateFormatter.format(run.startedAt)}</TableCell>
								<TableCell>{run.triggeredBy}</TableCell>
								<TableCell>
									<Badge
										variant={
											run.status === "SUCCESS"
												? "secondary"
												: run.status === "FAILED"
													? "destructive"
													: "outline"
										}
									>
										{run.status}
									</Badge>
								</TableCell>
								<TableCell>{run.matchesUpserted}</TableCell>
								<TableCell>{run.matchesFinalized}</TableCell>
								<TableCell className="max-w-48 truncate">
									{run.errorMessage ?? "—"}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
