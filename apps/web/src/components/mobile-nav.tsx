"use client";

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
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

interface MobileNavProps {
	navLinks: ReadonlyArray<{ href: Route; label: string }>;
}

export function MobileNav({ navLinks }: MobileNavProps) {
	const pathname = usePathname();
	const t = useTranslations("Header");

	return (
		<Sheet>
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
					{navLinks.map(({ href, label }) => {
						const isActive = pathname === href;
						return (
							<SheetClose
								key={href}
								render={<Link href={href} />}
								className={cn(
									"rounded-lg px-3 py-2.5 font-semibold text-sm",
									isActive
										? "bg-muted text-foreground"
										: "text-muted-foreground hover:bg-muted hover:text-foreground",
								)}
							>
								{label}
							</SheetClose>
						);
					})}
				</nav>
			</SheetContent>
		</Sheet>
	);
}
