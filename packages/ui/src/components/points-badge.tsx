import { cn } from "@world-cup/ui/lib/utils";

function PointsBadge({ points }: { points: number | null }) {
	if (points === null) {
		return <span className="font-mono text-muted-foreground text-sm">·</span>;
	}

	const kind = points >= 10 ? "exact" : points > 0 ? "correct" : "miss";

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-md border px-2 py-0.5 font-bold font-mono text-xs",
				kind === "exact" &&
					"border-points-exact-border bg-points-exact-bg text-points-exact-text",
				kind === "correct" &&
					"border-points-correct-border bg-points-correct-bg text-points-correct-text",
				kind === "miss" &&
					"border-points-miss-border bg-points-miss-bg text-points-miss-text",
			)}
		>
			+{points}
		</span>
	);
}

export { PointsBadge };
