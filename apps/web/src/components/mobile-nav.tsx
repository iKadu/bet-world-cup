"use client";

import { authClient } from "@world-cup/auth/client";
import type { ServerSession } from "@world-cup/auth/server";
import { Button } from "@world-cup/ui/components/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@world-cup/ui/components/sheet";
import { cn } from "@world-cup/ui/lib/utils";
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LanguageSwitcher } from "./language-switcher";
import { ModeToggle } from "./mode-toggle";
import { getFlatNavItems } from "./nav-items";

interface MobileNavProps {
	session: ServerSession;
}

export function MobileNav({ session }: MobileNavProps) {
	const pathname = usePathname();
	const router = useRouter();
	const t = useTranslations("Header");
	const isAdmin = session?.user.role === "admin";
	const [open, setOpen] = useState(false);

	const navItems = getFlatNavItems(t, isAdmin);

	async function handleSignOut() {
		setOpen(false);
		await authClient.signOut();
		router.push("/");
		router.refresh();
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						className="sm:hidden"
						aria-label={t("openMenu")}
					/>
				}
			>
				<MenuIcon className="size-5" />
			</SheetTrigger>
			<SheetContent>
				<SheetTitle className="mb-2">WC26</SheetTitle>
				<nav className="flex flex-col gap-1">
					{navItems.map(({ href, label, icon: Icon }) => {
						const isActive = pathname === href;
						return (
							<SheetClose
								key={href}
								render={<Link href={href} />}
								className={cn(
									"flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-semibold text-sm",
									isActive
										? "bg-muted text-foreground"
										: "text-muted-foreground hover:bg-muted hover:text-foreground",
								)}
							>
								<Icon className="size-4" />
								{label}
							</SheetClose>
						);
					})}
				</nav>
				<div className="my-2 h-px bg-border" />
				<div className="flex items-center gap-2 px-1">
					<LanguageSwitcher />
					<ModeToggle />
				</div>
				<div className="my-2 h-px bg-border" />
				{session ? (
					<button
						type="button"
						onClick={handleSignOut}
						className="rounded-lg px-3 py-2.5 text-left font-semibold text-destructive text-sm hover:bg-destructive/10"
					>
						{t("signOut")}
					</button>
				) : (
					<div className="flex flex-col gap-2">
						<SheetClose
							render={<Link href="/sign-in" />}
							className="rounded-lg px-3 py-2.5 text-center font-semibold text-sm hover:bg-muted"
						>
							{t("signIn")}
						</SheetClose>
						<SheetClose
							render={<Link href="/sign-up" />}
							className="rounded-lg bg-primary px-3 py-2.5 text-center font-semibold text-primary-foreground text-sm"
						>
							{t("signUp")}
						</SheetClose>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
