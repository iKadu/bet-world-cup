import { Badge } from "@world-cup/ui/components/badge";

type BadgeVariant = "default" | "secondary" | "outline" | "destructive";

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> =
	{
		SCHEDULED: { label: "Agendado", variant: "outline" },
		TIMED: { label: "Agendado", variant: "outline" },
		IN_PLAY: { label: "Em andamento", variant: "default" },
		PAUSED: { label: "Intervalo", variant: "default" },
		FINISHED: { label: "Finalizado", variant: "secondary" },
		POSTPONED: { label: "Adiado", variant: "destructive" },
		SUSPENDED: { label: "Suspenso", variant: "destructive" },
		CANCELLED: { label: "Cancelado", variant: "destructive" },
	};

function MatchStatusBadge({ status }: { status: string }) {
	const config = STATUS_CONFIG[status] ?? {
		label: status,
		variant: "outline" as const,
	};

	return <Badge variant={config.variant}>{config.label}</Badge>;
}

export { MatchStatusBadge };
