"use client";

import { Button } from "@world-cup/ui/components/button";
import { ScoreInput } from "@world-cup/ui/components/score-input";
import { useActionState, useEffect, useState } from "react";
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
	const hasExisting =
		defaultHomeValue !== undefined && defaultAwayValue !== undefined;
	const [isEditing, setIsEditing] = useState(!hasExisting);
	const [state, formAction, isPending] = useActionState(submitPrediction, null);

	useEffect(() => {
		if (!state) return;

		if (state.success) {
			toast.success("Palpite salvo!");
			setIsEditing(false);
		} else {
			toast.error(state.error);
		}
	}, [state]);

	if (!isEditing && hasExisting) {
		return (
			<div className="flex items-center gap-2">
				<span className="rounded-md border border-points-exact-border bg-points-exact-bg px-2.5 py-1 font-bold font-mono text-points-exact-text text-xs">
					PICK {defaultHomeValue}–{defaultAwayValue}
				</span>
				<button
					type="button"
					onClick={() => setIsEditing(true)}
					className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide hover:text-foreground"
				>
					✓ salvo
				</button>
			</div>
		);
	}

	return (
		<form action={formAction} className="flex items-center gap-2">
			<input type="hidden" name="matchId" value={matchId} />
			<ScoreInput
				homeName="homeScoreGuess"
				awayName="awayScoreGuess"
				defaultHomeValue={defaultHomeValue}
				defaultAwayValue={defaultAwayValue}
				disabled={isPending}
			/>
			<Button type="submit" size="sm" disabled={isPending}>
				{isPending ? "..." : "Salvar"}
			</Button>
		</form>
	);
}
