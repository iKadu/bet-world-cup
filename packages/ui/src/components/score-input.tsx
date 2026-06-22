import { Input } from "@world-cup/ui/components/input";
import { cn } from "@world-cup/ui/lib/utils";

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
			<Input
				type="number"
				min={0}
				name={homeName}
				defaultValue={defaultHomeValue}
				disabled={disabled}
				className="w-12 text-center"
				aria-label="Placar do time da casa"
			/>
			<span className="text-muted-foreground text-xs">x</span>
			<Input
				type="number"
				min={0}
				name={awayName}
				defaultValue={defaultAwayValue}
				disabled={disabled}
				className="w-12 text-center"
				aria-label="Placar do time visitante"
			/>
		</div>
	);
}

export { ScoreInput };
