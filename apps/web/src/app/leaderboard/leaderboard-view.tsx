"use client";

import { Avatar, AvatarFallback } from "@world-cup/ui/components/avatar";
import { Input } from "@world-cup/ui/components/input";
import { useDebouncedValue } from "@world-cup/ui/hooks/use-debounced-value";
import { useFocusShortcut } from "@world-cup/ui/hooks/use-focus-shortcut";
import { cn } from "@world-cup/ui/lib/utils";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import type { LeaderboardRow } from "@/lib/ranking";

function getInitials(name: string) {
	const initials = name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0] ?? "")
		.join("");

	return initials.toUpperCase() || "?";
}

interface LeaderboardViewProps {
	rows: LeaderboardRow[];
	currentUserId: string | undefined;
}

export function LeaderboardView({ rows, currentUserId }: LeaderboardViewProps) {
	const t = useTranslations("Leaderboard");
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedQuery = useDebouncedValue(searchQuery, 250);
	const searchInputRef = useRef<HTMLInputElement>(null);
	useFocusShortcut("/", searchInputRef);

	const podium = [rows[1], rows[0], rows[2]];

	const filteredRows = useMemo(() => {
		const query = debouncedQuery.trim().toLowerCase();
		return query
			? rows.filter((row) => row.name.toLowerCase().includes(query))
			: rows;
	}, [rows, debouncedQuery]);

	return (
		<>
			<Input
				ref={searchInputRef}
				type="search"
				value={searchQuery}
				onChange={(event) => setSearchQuery(event.target.value)}
				placeholder={t("searchPlaceholder")}
				className="mb-6 h-9 max-w-xs rounded-lg"
			/>

			{rows.length >= 2 && (
				<div className="mb-8 grid grid-cols-3 items-end gap-3 sm:gap-4">
					{podium.map((entry, index) => {
						if (!entry) return <div key={`empty-${index}`} />;
						const rank = index === 0 ? 2 : index === 1 ? 1 : 3;
						return (
							<PodiumCard
								key={entry.userId}
								entry={entry}
								rank={rank}
								emphasized={rank === 1}
								t={t}
							/>
						);
					})}
				</div>
			)}

			<div className="overflow-hidden rounded-xl border">
				<div className="hidden grid-cols-[60px_1fr_120px_120px] gap-3 border-b bg-surface-row px-5 py-2.5 font-mono text-[10px] text-muted-foreground uppercase tracking-widest sm:grid">
					<span>{t("colPosition")}</span>
					<span>{t("colPlayer")}</span>
					<span>{t("colExact")}</span>
					<span className="text-right">{t("colPoints")}</span>
				</div>
				{filteredRows.length === 0 ? (
					<p className="py-10 text-center text-muted-foreground text-sm">
						{t("empty")}
					</p>
				) : (
					filteredRows.map((row) => (
						<LeaderboardRowItem
							key={row.userId}
							row={row}
							position={rows.indexOf(row) + 1}
							isYou={row.userId === currentUserId}
							t={t}
						/>
					))
				)}
			</div>
		</>
	);
}

type LeaderboardTranslator = ReturnType<typeof useTranslations>;

function PodiumCard({
	entry,
	rank,
	emphasized,
	t,
}: {
	entry: LeaderboardRow;
	rank: 1 | 2 | 3;
	emphasized: boolean;
	t: LeaderboardTranslator;
}) {
	const rankColor =
		rank === 2
			? "text-[#c8cdd6]"
			: rank === 3
				? "text-[#cd8b54]"
				: "text-accent-text";

	return (
		<div
			className={cn(
				"flex flex-col items-center gap-1.5 rounded-xl border px-2 py-4 text-center sm:gap-2 sm:px-4 sm:py-5",
				emphasized
					? "border-accent-lime/35 bg-card shadow-[0_0_0_1px_rgba(194,242,61,.1),0_20px_50px_-20px_rgba(194,242,61,.18)] sm:pb-7"
					: "border-border bg-card/60",
			)}
		>
			{emphasized && (
				<span className="font-mono text-[10px] text-accent-text uppercase tracking-widest">
					{t("leaderTag")}
				</span>
			)}
			<Avatar size={emphasized ? "lg" : "default"}>
				<AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 font-bold font-display text-primary-foreground">
					{getInitials(entry.name)}
				</AvatarFallback>
			</Avatar>
			<span className="truncate font-display font-semibold text-sm">
				{entry.name}
			</span>
			<span
				className={cn(
					"font-bold font-mono",
					emphasized
						? "text-3xl text-accent-text sm:text-4xl"
						: `text-xl sm:text-2xl ${rankColor}`,
				)}
			>
				{entry.totalPoints}
			</span>
			<span className="font-mono text-[11px] text-muted-foreground">
				{t("exactScoresCount", { count: entry.exactCount })}
			</span>
		</div>
	);
}

function LeaderboardRowItem({
	row,
	position,
	isYou,
	t,
}: {
	row: LeaderboardRow;
	position: number;
	isYou: boolean;
	t: LeaderboardTranslator;
}) {
	return (
		<div
			className={cn(
				"grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 border-b px-5 py-3 last:border-b-0 sm:grid-cols-[60px_1fr_120px_120px] sm:gap-y-0",
				isYou && "bg-points-exact-bg",
			)}
		>
			<span className="col-start-1 row-start-1 font-bold font-mono text-sm sm:col-start-auto sm:row-start-auto">
				{position}
			</span>
			<span className="col-start-2 row-start-1 flex items-center gap-2 sm:col-start-auto sm:row-start-auto">
				<Avatar size="sm">
					<AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 font-bold font-display text-[10px] text-primary-foreground">
						{getInitials(row.name)}
					</AvatarFallback>
				</Avatar>
				<span className="font-display font-semibold text-sm">{row.name}</span>
				{isYou && (
					<span className="rounded-full bg-accent-lime/15 px-2 py-0.5 font-mono text-[10px] text-accent-text uppercase">
						{t("you")}
					</span>
				)}
			</span>
			<span className="col-start-1 row-start-2 font-mono text-muted-foreground text-sm sm:col-start-auto sm:row-start-auto">
				{row.exactCount}
			</span>
			<span
				className={cn(
					"col-start-2 row-start-2 text-right font-bold font-mono text-sm sm:col-start-auto sm:row-start-auto",
					isYou && "text-accent-text",
				)}
			>
				{row.totalPoints}
			</span>
		</div>
	);
}
