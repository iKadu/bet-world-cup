"use client";

import { authClient } from "@world-cup/auth/client";
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
import { cn } from "@world-cup/ui/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { LanguageSwitcher } from "./language-switcher";
import { ModeToggle } from "./mode-toggle";

function getInitials(name: string) {
	const initials = name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0] ?? "")
		.join("");

	return initials.toUpperCase() || "?";
}

export default function Header() {
	const router = useRouter();
	const pathname = usePathname();
	const t = useTranslations("Header");
	const { data: session } = authClient.useSession();
	const isAdmin = session?.user.role === "admin";

	const navLinks = [
		{ href: "/", label: t("navHome") },
		{ href: "/matches", label: t("navMatches") },
		{ href: "/leaderboard", label: t("navRanking") },
	] as const;

	async function handleSignOut() {
		await authClient.signOut();
		router.push("/");
		router.refresh();
	}

	return (
		<header className="sticky top-0 z-40 border-b bg-gradient-to-b from-card to-background/95 px-5 py-3.5 backdrop-blur sm:px-7">
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
				<div className="flex items-center gap-5 sm:gap-7">
					<Link href="/" className="flex shrink-0 items-center gap-2.5">
						<span className="flex size-[28px] -skew-x-[7deg] items-center justify-center rounded-md bg-primary font-display font-extrabold text-primary-foreground text-sm">
							W
						</span>
						<span className="font-display font-extrabold text-sm tracking-[0.2em]">
							WC26
						</span>
					</Link>
					{isAdmin ? (
						<Badge
							render={<Link href="/admin/sync" />}
							className="border-amber/40 bg-amber/15 text-amber-foreground hover:bg-amber/25"
						>
							{t("admin")}
						</Badge>
					) : null}
					<nav className="hidden items-center gap-5 sm:flex">
						{navLinks.map(({ href, label }) => {
							const isActive = pathname === href;
							return (
								<Link
									key={href}
									href={href}
									className={cn(
										"relative py-1 font-semibold text-sm transition-colors",
										isActive
											? "text-foreground after:absolute after:inset-x-0 after:-bottom-[15px] after:h-0.5 after:bg-primary"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									{label}
								</Link>
							);
						})}
					</nav>
				</div>
				<div className="flex items-center gap-2.5">
					<LanguageSwitcher />
					<ModeToggle />
					{session ? (
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<Button
										variant="outline"
										size="sm"
										className="gap-2 rounded-full pr-3 pl-1.5"
									/>
								}
							>
								<Avatar size="sm">
									<AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 font-bold font-display text-[10px] text-primary-foreground">
										{getInitials(session.user.name)}
									</AvatarFallback>
								</Avatar>
								<span className="hidden font-medium sm:inline">
									{session.user.name}
								</span>
								<span className="text-muted-foreground text-xs">▾</span>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuGroup>
									<DropdownMenuLabel>{session.user.email}</DropdownMenuLabel>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem render={<Link href="/predictions" />}>
									{t("myPredictions")}
								</DropdownMenuItem>
								{isAdmin ? (
									<DropdownMenuItem render={<Link href="/admin/sync" />}>
										{t("adminSync")}
									</DropdownMenuItem>
								) : null}
								<DropdownMenuSeparator />
								<DropdownMenuItem variant="destructive" onClick={handleSignOut}>
									{t("signOut")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<div className="flex items-center gap-2">
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
			</div>
		</header>
	);
}
