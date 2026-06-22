import { and, eq } from "drizzle-orm";
import { db } from "../index";
import { matches, predictions } from "../schema";
import {
	POINTS_CORRECT_OUTCOME,
	POINTS_EXACT_SCORE,
	POINTS_WRONG,
} from "./constants";

export async function findUnscoredFinishedMatchIds(): Promise<string[]> {
	const rows = await db
		.select({ id: matches.id })
		.from(matches)
		.where(
			and(eq(matches.status, "FINISHED"), eq(matches.pointsAwarded, false)),
		);

	return rows.map((row) => row.id);
}

function calculatePoints(
	homeScoreGuess: number,
	awayScoreGuess: number,
	homeScore: number,
	awayScore: number,
): number {
	if (homeScoreGuess === homeScore && awayScoreGuess === awayScore) {
		return POINTS_EXACT_SCORE;
	}

	const guessedOutcome = Math.sign(homeScoreGuess - awayScoreGuess);
	const actualOutcome = Math.sign(homeScore - awayScore);

	return guessedOutcome === actualOutcome
		? POINTS_CORRECT_OUTCOME
		: POINTS_WRONG;
}

export async function scoreMatch(matchId: string): Promise<void> {
	await db.transaction(async (tx) => {
		const [match] = await tx
			.select({ homeScore: matches.homeScore, awayScore: matches.awayScore })
			.from(matches)
			.where(eq(matches.id, matchId));

		if (!match || match.homeScore === null || match.awayScore === null) {
			return;
		}

		const matchPredictions = await tx
			.select({
				id: predictions.id,
				homeScoreGuess: predictions.homeScoreGuess,
				awayScoreGuess: predictions.awayScoreGuess,
			})
			.from(predictions)
			.where(eq(predictions.matchId, matchId));

		for (const prediction of matchPredictions) {
			const pointsEarned = calculatePoints(
				prediction.homeScoreGuess,
				prediction.awayScoreGuess,
				match.homeScore,
				match.awayScore,
			);

			await tx
				.update(predictions)
				.set({ pointsEarned })
				.where(eq(predictions.id, prediction.id));
		}

		await tx
			.update(matches)
			.set({ pointsAwarded: true })
			.where(eq(matches.id, matchId));
	});
}
