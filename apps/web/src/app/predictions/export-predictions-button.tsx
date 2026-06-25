"use client";

import { Button } from "@world-cup/ui/components/button";
import { useTranslations } from "next-intl";

export interface ExportRow {
	group: string | null;
	stage: string;
	homeTeam: string;
	awayTeam: string;
	homeScoreGuess: number;
	awayScoreGuess: number;
	homeScore: number | null;
	awayScore: number | null;
	pointsEarned: number | null;
}

export function ExportPredictionsButton({ rows }: { rows: ExportRow[] }) {
	const t = useTranslations("Predictions");

	function handleExport() {
		const blob = new Blob([JSON.stringify(rows, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "my-predictions.json";
		link.click();
		URL.revokeObjectURL(url);
	}

	return (
		<Button variant="outline" size="sm" onClick={handleExport}>
			{t("exportJson")}
		</Button>
	);
}
