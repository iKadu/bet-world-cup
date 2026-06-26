"use client";

import { Avatar, AvatarFallback } from "@world-cup/ui/components/avatar";
import {
	Dialog,
	DialogBackdrop,
	DialogPopup,
	DialogPortal,
} from "@world-cup/ui/components/dialog";
import { TeamFlag } from "@world-cup/ui/components/flag";
import { cn, getInitials } from "@world-cup/ui/lib/utils";
import {
	CalendarDaysIcon,
	ClipboardListIcon,
	GitCompareIcon,
	HomeIcon,
	SearchIcon,
	SettingsIcon,
	TrophyIcon,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCommandPaletteIndex } from "@/lib/command-palette-data";

type PaletteItem =
	| {
			type: "page";
			id: string;
			label: string;
			href: Route;
			icon: typeof HomeIcon;
	  }
	| { type: "team"; id: string; label: string; tla: string | null }
	| { type: "player"; id: string; label: string };

interface CommandPaletteProps {
	isAdmin: boolean;
}

export function CommandPalette({ isAdmin }: CommandPaletteProps) {
	const router = useRouter();
	const t = useTranslations("CommandPalette");
	const tHeader = useTranslations("Header");
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [data, setData] = useState<{
		teams: { id: string; name: string; tla: string | null }[];
		players: { id: string; name: string }[];
	} | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const loadedRef = useRef(false);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.ctrlKey && event.key === " ") {
				event.preventDefault();
				setOpen((value) => !value);
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	useEffect(() => {
		if (!open || loadedRef.current) return;
		loadedRef.current = true;
		getCommandPaletteIndex().then(setData);
	}, [open]);

	useEffect(() => {
		if (open) {
			setQuery("");
			setSelectedIndex(0);
		}
	}, [open]);

	const pages = useMemo<PaletteItem[]>(() => {
		const items: PaletteItem[] = [
			{
				type: "page",
				id: "home",
				label: tHeader("navHome"),
				href: "/",
				icon: HomeIcon,
			},
			{
				type: "page",
				id: "matches",
				label: tHeader("navMatches"),
				href: "/matches",
				icon: CalendarDaysIcon,
			},
			{
				type: "page",
				id: "leaderboard",
				label: tHeader("navRanking"),
				href: "/leaderboard",
				icon: TrophyIcon,
			},
			{
				type: "page",
				id: "compare",
				label: tHeader("navCompare"),
				href: "/compare",
				icon: GitCompareIcon,
			},
			{
				type: "page",
				id: "predictions",
				label: tHeader("myPredictions"),
				href: "/predictions",
				icon: ClipboardListIcon,
			},
		];

		if (isAdmin) {
			items.push({
				type: "page",
				id: "admin-sync",
				label: tHeader("adminSync"),
				href: "/admin/sync",
				icon: SettingsIcon,
			});
		}

		return items;
	}, [tHeader, isAdmin]);

	const allItems = useMemo<PaletteItem[]>(() => {
		const teamItems: PaletteItem[] = (data?.teams ?? []).map((team) => ({
			type: "team",
			id: team.id,
			label: team.name,
			tla: team.tla,
		}));
		const playerItems: PaletteItem[] = (data?.players ?? []).map((player) => ({
			type: "player",
			id: player.id,
			label: player.name,
		}));

		return [...pages, ...teamItems, ...playerItems];
	}, [pages, data]);

	const filteredItems = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return allItems;
		return allItems.filter((item) =>
			item.label.toLowerCase().includes(normalizedQuery),
		);
	}, [allItems, query]);

	function selectItem(item: PaletteItem) {
		setOpen(false);
		if (item.type === "page") {
			router.push(item.href);
		} else if (item.type === "team") {
			router.push(`/matches?team=${item.id}` as Route);
		} else {
			router.push(`/leaderboard?highlight=${item.id}` as Route);
		}
	}

	function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setSelectedIndex((index) =>
				Math.min(index + 1, filteredItems.length - 1),
			);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setSelectedIndex((index) => Math.max(index - 1, 0));
		} else if (event.key === "Enter") {
			event.preventDefault();
			const item = filteredItems[selectedIndex];
			if (item) selectItem(item);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogPortal>
				<DialogBackdrop />
				<DialogPopup
					initialFocus={inputRef}
					className="flex max-h-[60vh] flex-col overflow-hidden"
				>
					<div className="flex items-center gap-2.5 border-b px-4 py-3">
						<SearchIcon className="size-4 shrink-0 text-muted-foreground" />
						<input
							ref={inputRef}
							value={query}
							onChange={(event) => {
								setQuery(event.target.value);
								setSelectedIndex(0);
							}}
							onKeyDown={handleInputKeyDown}
							placeholder={t("placeholder")}
							className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
						/>
						<kbd className="shrink-0 rounded-md border bg-surface-row px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
							esc
						</kbd>
					</div>
					<div className="flex-1 overflow-y-auto p-1.5">
						{filteredItems.length === 0 ? (
							<p className="px-3 py-6 text-center text-muted-foreground text-sm">
								{t("empty")}
							</p>
						) : (
							filteredItems.map((item, index) => (
								<button
									key={`${item.type}-${item.id}`}
									type="button"
									onClick={() => selectItem(item)}
									onMouseEnter={() => setSelectedIndex(index)}
									className={cn(
										"flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm",
										index === selectedIndex
											? "bg-accent text-accent-foreground"
											: "text-foreground",
									)}
								>
									<PaletteItemIcon item={item} />
									<span className="truncate">{item.label}</span>
									<span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
										{t(item.type)}
									</span>
								</button>
							))
						)}
					</div>
				</DialogPopup>
			</DialogPortal>
		</Dialog>
	);
}

function PaletteItemIcon({ item }: { item: PaletteItem }) {
	if (item.type === "page") {
		const Icon = item.icon;
		return <Icon className="size-4 shrink-0 text-muted-foreground" />;
	}

	if (item.type === "team") {
		return (
			<span className="flex size-4 shrink-0 items-center justify-center">
				<TeamFlag tla={item.tla} />
			</span>
		);
	}

	return (
		<Avatar size="sm" className="size-5">
			<AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 text-[9px]">
				{getInitials(item.label)}
			</AvatarFallback>
		</Avatar>
	);
}
