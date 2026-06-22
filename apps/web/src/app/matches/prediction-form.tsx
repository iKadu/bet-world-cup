"use client";

import { Button } from "@world-cup/ui/components/button";
import { ScoreInput } from "@world-cup/ui/components/score-input";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { submitPrediction } from "./actions";

interface PredictionFormProps {
	matchId: string;
	defaultHomeValue?: number;
	defaultAwayValue?: number;
}

export function PredictionForm({
	matchId,
	defaultHomeValue,
	defaultAwayValue,
}: PredictionFormProps) {
	const [state, formAction, isPending] = useActionState(submitPrediction, null);

	useEffect(() => {
		if (!state) return;

		if (state.success) {
			toast.success("Palpite salvo!");
		} else {
			toast.error(state.error);
		}
	}, [state]);

	return (
		<form action={formAction} className="flex items-center gap-2">
			<input type="hidden" name="matchId" value={matchId} />
			<ScoreInput
				homeName="homeScoreGuess"
				awayName="awayScoreGuess"
				defaultHomeValue={defaultHomeValue}
				defaultAwayValue={defaultAwayValue}
			/>
			<Button type="submit" size="sm" disabled={isPending}>
				{isPending ? "Salvando..." : "Salvar"}
			</Button>
		</form>
	);
}
