"use client";

import { Button } from "@world-cup/ui/components/button";
import { ScoreInput } from "@world-cup/ui/components/score-input";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { submitPrediction } from "./actions";

interface PredictionFormRowProps {
	matchId: string;
	className: string;
	groupCell: ReactNode;
	homeCell: ReactNode;
	awayCell: ReactNode;
}

export function PredictionFormRow({
	matchId,
	className,
	groupCell,
	homeCell,
	awayCell,
}: PredictionFormRowProps) {
	const t = useTranslations("Matches");
	const [state, formAction, isPending] = useActionState(submitPrediction, null);

	useEffect(() => {
		if (!state) return;

		if (state.success) {
			toast.success(t("saveSuccess"));
		} else {
			toast.error(state.error);
		}
	}, [state, t]);

	return (
		<form action={formAction} className={className}>
			<input type="hidden" name="matchId" value={matchId} />
			{groupCell}
			{homeCell}
			<div className="col-start-2 row-start-2 flex h-[54px] items-center justify-center sm:col-start-auto sm:row-start-auto">
				<ScoreInput
					homeName="homeScoreGuess"
					awayName="awayScoreGuess"
					disabled={isPending}
				/>
			</div>
			{awayCell}
			<div className="col-start-3 row-start-1 flex items-center justify-end sm:col-start-auto sm:row-start-auto">
				<Button type="submit" size="sm" disabled={isPending}>
					{isPending ? t("saving") : t("save")}
				</Button>
			</div>
		</form>
	);
}
