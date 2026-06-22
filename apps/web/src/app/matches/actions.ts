"use server";

import { auth } from "@world-cup/auth";
import { db } from "@world-cup/db";
import { isMatchLocked } from "@world-cup/db/lib/match-lock";
import { matches, predictions } from "@world-cup/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
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
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session) {
		return { success: false, error: "Você precisa entrar para palpitar." };
	}

	const parsed = submitPredictionSchema.safeParse({
		matchId: formData.get("matchId"),
		homeScoreGuess: formData.get("homeScoreGuess"),
		awayScoreGuess: formData.get("awayScoreGuess"),
	});

	if (!parsed.success) {
		return { success: false, error: "Palpite inválido." };
	}

	const [match] = await db
		.select({ kickoff: matches.kickoff, status: matches.status })
		.from(matches)
		.where(eq(matches.id, parsed.data.matchId));

	if (!match) {
		return { success: false, error: "Partida não encontrada." };
	}

	if (isMatchLocked(match)) {
		return { success: false, error: "Essa partida já começou ou terminou." };
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
