"use client";

import { Button } from "@world-cup/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@world-cup/ui/components/dropdown-menu";
import { cn } from "@world-cup/ui/lib/utils";
import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useRef } from "react";

function applyThemeWithTransition(
	origin: HTMLElement | null,
	apply: () => void,
) {
	if (!origin || !document.startViewTransition) {
		apply();
		return;
	}

	const { left, top, width, height } = origin.getBoundingClientRect();
	const x = left + width / 2;
	const y = top + height / 2;
	const endRadius = Math.hypot(
		Math.max(x, window.innerWidth - x),
		Math.max(y, window.innerHeight - y),
	);

	const transition = document.startViewTransition(apply);
	transition.ready.then(() => {
		document.documentElement.animate(
			{
				clipPath: [
					`circle(0px at ${x}px ${y}px)`,
					`circle(${endRadius}px at ${x}px ${y}px)`,
				],
			},
			{
				duration: 550,
				easing: "ease-in-out",
				pseudoElement: "::view-transition-new(root)",
			},
		);
	});
}

interface ModeToggleProps {
	className?: string;
}

export function ModeToggle({ className }: ModeToggleProps) {
	const { theme, setTheme } = useTheme();
	const triggerRef = useRef<HTMLButtonElement>(null);

	function handleSelect(next: string) {
		if (next === theme) return;
		applyThemeWithTransition(triggerRef.current, () => setTheme(next));
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						ref={triggerRef}
						variant="ghost"
						size="icon"
						className={cn("relative", className)}
					/>
				}
			>
				<SunIcon className="size-4 rotate-0 scale-100 transition-transform duration-500 ease-out dark:-rotate-90 dark:scale-0" />
				<MoonIcon className="absolute size-4 rotate-90 scale-0 transition-transform duration-500 ease-out dark:rotate-0 dark:scale-100" />
				<span className="sr-only">Toggle theme</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuRadioGroup value={theme} onValueChange={handleSelect}>
					<DropdownMenuRadioItem value="light">
						<SunIcon className="size-4" />
						Light
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="dark">
						<MoonIcon className="size-4" />
						Dark
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="system">
						<LaptopIcon className="size-4" />
						System
					</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
