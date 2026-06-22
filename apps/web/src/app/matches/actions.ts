"use server";

import { auth } from "@world-cup/auth";
import { db } from "@world-cup/db";
import { isMatchLocked } from "@world-cup/db/lib/match-lock";
import { matches, predictions } from "@world-cup/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

export type PredictionActionState =
	| { success: true }
	| { success: false; error: string }
	| null;

const submitPredictionSchema = z.object({
	matchId: z.string().min(1),
	homeScoreGuess: z.coerce.number().int().min(0),
	awayScoreGuess: z.coerce.number().int().min(0),
});

export async function submitPrediction(
	_previousState: PredictionActionState,
	formData: FormData,
): Promise<PredictionActionState> {
	const t = await getTranslations("PredictionErrors");
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session) {
		return { success: false, error: t("mustSignIn") };
	}

	const parsed = submitPredictionSchema.safeParse({
		matchId: formData.get("matchId"),
		homeScoreGuess: formData.get("homeScoreGuess"),
		awayScoreGuess: formData.get("awayScoreGuess"),
	});

	if (!parsed.success) {
		return { success: false, error: t("invalid") };
	}

	const [match] = await db
		.select({ kickoff: matches.kickoff, status: matches.status })
		.from(matches)
		.where(eq(matches.id, parsed.data.matchId));

	if (!match) {
		return { success: false, error: t("matchNotFound") };
	}

	if (isMatchLocked(match)) {
		return { success: false, error: t("locked") };
	}

	await db
		.insert(predictions)
		.values({
			userId: session.user.id,
			matchId: parsed.data.matchId,
			homeScoreGuess: parsed.data.homeScoreGuess,
			awayScoreGuess: parsed.data.awayScoreGuess,
		})
		.onConflictDoUpdate({
			target: [predictions.userId, predictions.matchId],
			set: {
				homeScoreGuess: parsed.data.homeScoreGuess,
				awayScoreGuess: parsed.data.awayScoreGuess,
				updatedAt: new Date(),
			},
		});

	revalidatePath("/matches");
	revalidatePath("/predictions");
	revalidatePath("/");

	return { success: true };
}
