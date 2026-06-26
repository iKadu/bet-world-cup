"use client";

import { useCountUp } from "@world-cup/ui/hooks/use-count-up";

export function CountUpNumber({
	value,
	durationMs,
}: {
	value: number;
	durationMs?: number;
}) {
	const displayValue = useCountUp(value, durationMs);
	return displayValue;
}
