"use client";

import { authClient } from "@world-cup/auth/client";
import type { ServerSession } from "@world-cup/auth/server";
import { Avatar, AvatarFallback } from "@world-cup/ui/components/avatar";
import { Badge } from "@world-cup/ui/components/badge";
import { Button } from "@world-cup/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@world-cup/ui/components/dropdown-menu";
import { cn, getInitials } from "@world-cup/ui/lib/utils";
import { ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { SidebarData } from "@/lib/sidebar-data";
import { openCommandPalette } from "./command-palette";
import { LanguageSwitcher } from "./language-switcher";
import { ModeToggle } from "./mode-toggle";
import { getNavGroups } from "./nav-items";

interface SidebarProps {
	session: ServerSession;
	data: SidebarData;
}

export function Sidebar({ session, data }: SidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const t = useTranslations("Header");
	const isAdmin = session?.user.role === "admin";

	const navGroups = getNavGroups(t, isAdmin, {
		matches: data.matchesCount,
		predictions: data.predictionsCount,
	});

	async function handleSignOut() {
		await authClient.signOut();
		router.push("/");
		router.refresh();
	}

	return (
		<aside className="sticky top-0 hidden h-svh w-[252px] shrink-0 flex-col border-r bg-sidebar p-4 text-sidebar-foreground sm:flex">
			<Link href="/" className="mb-4 flex items-center gap-2.5 px-1">
				<span className="flex size-[30px] shrink-0 -skew-x-[7deg] items-center justify-center rounded-md bg-sidebar-primary font-display font-extrabold text-sidebar-primary-foreground text-sm">
					W
				</span>
				<span className="font-display font-extrabold text-sm tracking-[0.2em]">
					WC26
				</span>
				{isAdmin && (
					<Badge className="ml-auto border-amber/40 bg-amber/15 text-amber-foreground">
						{t("admin")}
					</Badge>
				)}
			</Link>

			<button
				type="button"
				onClick={openCommandPalette}
				className="mb-5 flex h-10 items-center gap-2 rounded-lg border bg-sidebar px-3 text-muted-foreground text-sm transition-colors hover:text-foreground"
			>
				<SearchIcon className="size-4 shrink-0" />
				<span className="flex-1 text-left">{t("search")}</span>
				<span className="flex shrink-0 gap-1">
					<kbd className="rounded-md border bg-surface-row px-1.5 py-0.5 font-mono text-[10px]">
						Ctrl
					</kbd>
					<kbd className="rounded-md border bg-surface-row px-1.5 py-0.5 font-mono text-[10px]">
						Space
					</kbd>
				</span>
			</button>

			<nav className="flex flex-1 flex-col gap-5 overflow-y-auto">
				{navGroups.map((group) => (
					<div key={group.label}>
						<p className="mb-1.5 px-2.5 font-bold font-display text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
							{group.label}
						</p>
						<div className="flex flex-col gap-0.5">
							{group.items.map(({ href, label, icon: Icon, count }) => {
								const isActive = pathname === href;
								return (
									<Link
										key={href}
										href={href}
										className={cn(
											"flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 font-semibold text-sm transition-colors",
											isActive
												? "bg-sidebar-accent text-sidebar-accent-foreground"
												: "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
										)}
									>
										<Icon className="size-4 shrink-0" />
										<span className="flex-1 truncate">{label}</span>
										{count !== undefined && (
											<span className="font-mono text-[11px] text-muted-foreground">
												{count}
											</span>
										)}
									</Link>
								);
							})}
						</div>
					</div>
				))}
			</nav>

			<div className="mt-auto flex flex-col gap-3 border-t pt-3">
				{data.liveMatches.length > 0 && (
					<div className="rounded-lg border border-live/40 bg-live/10 p-3">
						<div className="mb-1.5 flex items-center gap-1.5 font-mono text-[11px] text-live-foreground uppercase tracking-wide">
							<span className="size-1.5 animate-live-pulse rounded-full bg-live" />
							{t("liveNow", { count: data.liveMatches.length })}
						</div>
						<div className="flex flex-col gap-0.5">
							{data.liveMatches.map((match) => (
								<p
									key={match.id}
									className="truncate font-display font-semibold text-xs"
								>
									{match.homeTeamName} – {match.awayTeamName}
								</p>
							))}
						</div>
					</div>
				)}

				<div className="grid grid-cols-2 divide-x overflow-hidden rounded-lg border bg-sidebar">
					<LanguageSwitcher className="h-9 w-full justify-center rounded-none" />
					<ModeToggle className="h-9 w-full rounded-none" />
				</div>

				{session ? (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									variant="ghost"
									className="h-auto justify-start gap-2.5 px-2.5 py-2"
								/>
							}
						>
							<Avatar size="sm">
								<AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 font-bold font-display text-[10px] text-primary-foreground">
									{getInitials(session.user.name)}
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-col items-start">
								<span className="font-semibold text-xs">
									{session.user.name}
								</span>
								<span className="font-mono text-[10px] text-muted-foreground">
									{data.userRank ? (
										<>
											<span className="text-accent-text">#{data.userRank}</span>{" "}
											· {data.userPoints} pts
										</>
									) : (
										"—"
									)}
								</span>
							</div>
							<ChevronsUpDownIcon className="ml-auto size-3.5 text-muted-foreground" />
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuGroup>
								<DropdownMenuLabel>{session.user.email}</DropdownMenuLabel>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem variant="destructive" onClick={handleSignOut}>
								{t("signOut")}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<div className="flex flex-col gap-2">
						<Button
							variant="ghost"
							size="sm"
							nativeButton={false}
							render={<Link href="/sign-in" />}
						>
							{t("signIn")}
						</Button>
						<Button
							size="sm"
							nativeButton={false}
							render={<Link href="/sign-up" />}
						>
							{t("signUp")}
						</Button>
					</div>
				)}
			</div>
		</aside>
	);
}
