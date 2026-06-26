"use client";

import { Button } from "@world-cup/ui/components/button";
import { ScoreInput } from "@world-cup/ui/components/score-input";
import { useActionToast } from "@world-cup/ui/hooks/use-action-toast";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useActionState, useOptimistic } from "react";
import { submitPrediction } from "./actions";

interface PredictionFormRowProps {
	matchId: string;
	className: string;
	groupCell: ReactNode;
	homeCell: ReactNode;
	awayCell: ReactNode;
}

interface OptimisticGuess {
	homeScoreGuess: number;
	awayScoreGuess: number;
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
	const [optimisticGuess, setOptimisticGuess] =
		useOptimistic<OptimisticGuess | null>(null);

	useActionToast(state, { successMessage: t("saveSuccess") });

	async function action(formData: FormData) {
		setOptimisticGuess({
			homeScoreGuess: Number(formData.get("homeScoreGuess")),
			awayScoreGuess: Number(formData.get("awayScoreGuess")),
		});
		await formAction(formData);
	}

	return (
		<form action={action} className={className}>
			<input type="hidden" name="matchId" value={matchId} />
			{groupCell}
			{homeCell}
			<div className="col-start-2 row-start-2 flex h-[54px] items-center justify-center sm:col-start-auto sm:row-start-auto">
				{optimisticGuess ? (
					<span className="zoom-in-95 fade-in-0 animate-in rounded-md border border-points-exact-border bg-points-exact-bg px-2.5 py-1 font-bold font-mono text-points-exact-text text-xs">
						{optimisticGuess.homeScoreGuess}–{optimisticGuess.awayScoreGuess}
					</span>
				) : (
					<ScoreInput
						homeName="homeScoreGuess"
						awayName="awayScoreGuess"
						disabled={isPending}
					/>
				)}
			</div>
			{awayCell}
			<div className="col-start-3 row-start-1 flex items-center justify-end sm:col-start-auto sm:row-start-auto">
				{optimisticGuess ? (
					<span className="zoom-in-95 fade-in-0 animate-in font-mono text-[11px] text-muted-foreground uppercase tracking-wide">
						{t("saved")}
					</span>
				) : (
					<Button type="submit" size="sm" disabled={isPending}>
						{isPending ? t("saving") : t("save")}
					</Button>
				)}
			</div>
		</form>
	);
}
