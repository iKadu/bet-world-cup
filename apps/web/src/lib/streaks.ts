import { db } from "@world-cup/db";
import { matches, predictions } from "@world-cup/db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function getCurrentStreak(userId: string): Promise<number> {
	const rows = await db
		.select({ pointsEarned: predictions.pointsEarned })
		.from(predictions)
		.innerJoin(matches, eq(predictions.matchId, matches.id))
		.where(and(eq(predictions.userId, userId), eq(matches.status, "FINISHED")))
		.orderBy(desc(matches.kickoff));

	let streak = 0;
	for (const row of rows) {
		if ((row.pointsEarned ?? 0) > 0) {
			streak++;
		} else {
			break;
		}
	}

	return streak;
}
