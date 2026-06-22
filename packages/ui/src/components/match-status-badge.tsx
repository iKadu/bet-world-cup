import { Badge } from "@world-cup/ui/components/badge";
import { cn } from "@world-cup/ui/lib/utils";

type StatusKind = "scheduled" | "live" | "finished" | "amber";

const STATUS_CONFIG: Record<string, { label: string; kind: StatusKind }> = {
	SCHEDULED: { label: "Agendado", kind: "scheduled" },
	TIMED: { label: "Agendado", kind: "scheduled" },
	IN_PLAY: { label: "Live", kind: "live" },
	PAUSED: { label: "Intervalo", kind: "live" },
	FINISHED: { label: "Final", kind: "finished" },
	POSTPONED: { label: "Adiado", kind: "amber" },
	SUSPENDED: { label: "Suspenso", kind: "amber" },
	CANCELLED: { label: "Cancelado", kind: "amber" },
};

const KIND_CLASSES: Record<StatusKind, string> = {
	scheduled: "border-border bg-foreground/5 text-muted-foreground",
	live: "border-live/45 bg-live/15 text-live-foreground",
	finished: "border-foreground/15 bg-foreground/8 text-foreground/80",
	amber: "border-amber/40 bg-amber/15 text-amber-foreground",
};

function MatchStatusBadge({ status }: { status: string }) {
	const config = STATUS_CONFIG[status] ?? {
		label: status,
		kind: "scheduled" as const,
	};

	return (
		<Badge
			variant="outline"
			className={cn("gap-1.5", KIND_CLASSES[config.kind])}
		>
			{config.kind === "live" && (
				<span className="size-1.5 animate-live-pulse rounded-full bg-live" />
			)}
			{config.label}
		</Badge>
	);
}

export { MatchStatusBadge };
