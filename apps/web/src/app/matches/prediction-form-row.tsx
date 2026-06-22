"use client";

import { Button } from "@world-cup/ui/components/button";
import { ScoreInput } from "@world-cup/ui/components/score-input";
import type { ReactNode } from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { submitPrediction } from "./actions";

interface PredictionFormRowProps {
	matchId: string;
	defaultHomeValue?: number;
	defaultAwayValue?: number;
	className: string;
	groupCell: ReactNode;
	homeCell: ReactNode;
	awayCell: ReactNode;
}

export function PredictionFormRow({
	matchId,
	defaultHomeValue,
	defaultAwayValue,
	className,
	groupCell,
	homeCell,
	awayCell,
}: PredictionFormRowProps) {
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
		<form action={formAction} className={className}>
			<input type="hidden" name="matchId" value={matchId} />
			{groupCell}
			{homeCell}
			<div className="flex h-[54px] items-center justify-center">
				<ScoreInput
					homeName="homeScoreGuess"
					awayName="awayScoreGuess"
					defaultHomeValue={defaultHomeValue}
					defaultAwayValue={defaultAwayValue}
					disabled={isPending}
				/>
			</div>
			{awayCell}
			<div className="flex items-center justify-end">
				<Button type="submit" size="sm" disabled={isPending}>
					{isPending ? "..." : "Salvar"}
				</Button>
			</div>
		</form>
	);
}
