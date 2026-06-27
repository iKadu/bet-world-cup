"use client";

import { Button } from "@world-cup/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@world-cup/ui/components/dropdown-menu";
import { Flag } from "@world-cup/ui/components/flag";
import { cn } from "@world-cup/ui/lib/utils";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";
import { type Locale, localeFlags, localeNames, locales } from "@/i18n/config";

interface LanguageSwitcherProps {
	className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
	const locale = useLocale() as Locale;
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function handleSelect(next: Locale) {
		if (next === locale) return;

		startTransition(async () => {
			await setLocale(next);
			router.refresh();
		});
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant="ghost"
						size="sm"
						disabled={isPending}
						className={cn("gap-1.5 px-2", className)}
					/>
				}
			>
				<Flag countryCode={localeFlags[locale]} />
				<span className="font-mono text-xs uppercase">{locale}</span>
				<ChevronDownIcon className="size-3 text-muted-foreground" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{locales.map((value) => (
					<DropdownMenuItem
						key={value}
						onClick={() => handleSelect(value)}
						className="gap-2"
					>
						<Flag countryCode={localeFlags[value]} />
						{localeNames[value]}
						{value === locale && (
							<CheckIcon className="ml-auto size-3.5 text-accent-text" />
						)}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
