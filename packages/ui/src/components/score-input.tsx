"use client";

import { cn } from "@world-cup/ui/lib/utils";
import { useRef } from "react";

interface ScoreTileProps {
	name: string;
	defaultValue?: number;
	disabled?: boolean;
	ariaLabel: string;
}

function ScoreTile({
	name,
	defaultValue,
	disabled,
	ariaLabel,
}: ScoreTileProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<div className="relative">
			<input
				ref={inputRef}
				type="number"
				min={0}
				max={99}
				name={name}
				defaultValue={defaultValue}
				disabled={disabled}
				aria-label={ariaLabel}
				placeholder="–"
				className="h-[54px] w-12 rounded-lg border border-input bg-surface-soft text-center font-bold font-mono text-xl outline-none transition-colors [appearance:textfield] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/15 disabled:opacity-60 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
			/>
			{!disabled && (
				<div className="absolute inset-y-0 right-0.5 flex flex-col justify-center gap-0.5">
					<button
						type="button"
						tabIndex={-1}
						onClick={() => inputRef.current?.stepUp()}
						aria-label="Aumentar"
						className="text-[8px] text-muted-foreground leading-none hover:text-foreground"
					>
						▲
					</button>
					<button
						type="button"
						tabIndex={-1}
						onClick={() => inputRef.current?.stepDown()}
						aria-label="Diminuir"
						className="text-[8px] text-muted-foreground leading-none hover:text-foreground"
					>
						▼
					</button>
				</div>
			)}
		</div>
	);
}

interface ScoreInputProps {
	homeName: string;
	awayName: string;
	defaultHomeValue?: number;
	defaultAwayValue?: number;
	disabled?: boolean;
	className?: string;
}

function ScoreInput({
	homeName,
	awayName,
	defaultHomeValue,
	defaultAwayValue,
	disabled,
	className,
}: ScoreInputProps) {
	return (
		<div className={cn("flex items-center gap-1.5", className)}>
			<ScoreTile
				name={homeName}
				defaultValue={defaultHomeValue}
				disabled={disabled}
				ariaLabel="Placar do time da casa"
			/>
			<span className="font-bold font-mono text-muted-foreground text-sm">
				:
			</span>
			<ScoreTile
				name={awayName}
				defaultValue={defaultAwayValue}
				disabled={disabled}
				ariaLabel="Placar do time visitante"
			/>
		</div>
	);
}

export { ScoreInput };
