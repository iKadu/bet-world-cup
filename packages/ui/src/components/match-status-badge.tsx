"use client";

import { Badge } from "@world-cup/ui/components/badge";
import { cn } from "@world-cup/ui/lib/utils";
import { useTranslations } from "next-intl";

type StatusKind = "scheduled" | "live" | "finished" | "amber";

const KNOWN_STATUSES = [
	"SCHEDULED",
	"TIMED",
	"IN_PLAY",
	"PAUSED",
	"FINISHED",
	"POSTPONED",
	"SUSPENDED",
	"CANCELLED",
] as const;

type KnownStatus = (typeof KNOWN_STATUSES)[number];

function isKnownStatus(status: string): status is KnownStatus {
	return (KNOWN_STATUSES as readonly string[]).includes(status);
}

const STATUS_KIND: Record<KnownStatus, StatusKind> = {
	SCHEDULED: "scheduled",
	TIMED: "scheduled",
	IN_PLAY: "live",
	PAUSED: "live",
	FINISHED: "finished",
	POSTPONED: "amber",
	SUSPENDED: "amber",
	CANCELLED: "amber",
};

const KIND_CLASSES: Record<StatusKind, string> = {
	scheduled: "border-border bg-foreground/5 text-muted-foreground",
	live: "border-live/45 bg-live/15 text-live-foreground",
	finished: "border-foreground/15 bg-foreground/8 text-foreground/80",
	amber: "border-amber/40 bg-amber/15 text-amber-foreground",
};

function MatchStatusBadge({ status }: { status: string }) {
	const t = useTranslations("MatchStatus");
	const known = isKnownStatus(status);
	const kind = known ? STATUS_KIND[status] : "scheduled";
	const label = known ? t(status) : status;

	return (
		<Badge variant="outline" className={cn("gap-1.5", KIND_CLASSES[kind])}>
			{kind === "live" && (
				<span className="size-1.5 animate-live-pulse rounded-full bg-live" />
			)}
			{label}
		</Badge>
	);
}

export { MatchStatusBadge };
