import { db } from "@world-cup/db";
import { syncRuns } from "@world-cup/db/schema";
import {
	findUnscoredFinishedMatchIds,
	scoreMatch,
} from "@world-cup/db/scoring";
import { upsertGroups, upsertMatches, upsertTeams } from "@world-cup/db/sync";
import {
	fetchWorldCupMatches,
	mapWorldCupMatches,
} from "@world-cup/football-data";
import { eq } from "drizzle-orm";

interface RunSyncOptions {
	triggeredBy: "CRON" | "MANUAL";
	triggeredByUserId?: string;
}

export async function runSync({
	triggeredBy,
	triggeredByUserId,
}: RunSyncOptions) {
	const [run] = await db
		.insert(syncRuns)
		.values({ triggeredBy, triggeredByUserId })
		.returning({ id: syncRuns.id });

	if (!run) {
		throw new Error("Failed to create sync run record");
	}

	try {
		const rawMatches = await fetchWorldCupMatches();
		const mapped = mapWorldCupMatches(rawMatches);

		await upsertGroups(mapped.groups);
		await upsertTeams(mapped.teams);
		await upsertMatches(mapped.matches);

		const unscoredMatchIds = await findUnscoredFinishedMatchIds();
		for (const matchId of unscoredMatchIds) {
			await scoreMatch(matchId);
		}

		await db
			.update(syncRuns)
			.set({
				status: "SUCCESS",
				matchesUpserted: mapped.matches.length,
				matchesFinalized: unscoredMatchIds.length,
				finishedAt: new Date(),
			})
			.where(eq(syncRuns.id, run.id));

		return {
			success: true as const,
			matchesUpserted: mapped.matches.length,
			matchesFinalized: unscoredMatchIds.length,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);

		await db
			.update(syncRuns)
			.set({ status: "FAILED", errorMessage, finishedAt: new Date() })
			.where(eq(syncRuns.id, run.id));

		return { success: false as const, error: errorMessage };
	}
}
