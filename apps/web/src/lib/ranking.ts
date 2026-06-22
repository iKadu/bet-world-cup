import { db } from "@world-cup/db";
import { predictions, user } from "@world-cup/db/schema";
import { POINTS_EXACT_SCORE } from "@world-cup/db/scoring";
import { eq, sql } from "drizzle-orm";

export interface LeaderboardRow {
	userId: string;
	name: string;
	totalPoints: number;
	exactCount: number;
}

export async function getLeaderboard(): Promise<LeaderboardRow[]> {
	return db
		.select({
			userId: user.id,
			name: user.name,
			totalPoints: sql<number>`coalesce(sum(${predictions.pointsEarned}), 0)`,
			exactCount: sql<number>`count(*) filter (where ${predictions.pointsEarned} = ${POINTS_EXACT_SCORE})`,
		})
		.from(user)
		.leftJoin(predictions, eq(predictions.userId, user.id))
		.groupBy(user.id, user.name)
		.orderBy(sql`coalesce(sum(${predictions.pointsEarned}), 0) desc`);
}
