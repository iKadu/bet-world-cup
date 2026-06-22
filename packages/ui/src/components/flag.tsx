import { getCountryCode } from "@world-cup/ui/lib/flags";
import { cn } from "@world-cup/ui/lib/utils";

interface FlagProps {
	countryCode: string;
	className?: string;
}

function Flag({ countryCode, className }: FlagProps) {
	return (
		<span
			role="img"
			aria-hidden="true"
			className={cn(
				"fi",
				`fi-${countryCode.toLowerCase()}`,
				"inline-block rounded-[2px]",
				className,
			)}
		/>
	);
}

interface TeamFlagProps {
	tla?: string | null;
	className?: string;
}

function TeamFlag({ tla, className }: TeamFlagProps) {
	const countryCode = getCountryCode(tla);

	if (!countryCode) return null;

	return <Flag countryCode={countryCode} className={className} />;
}

export { Flag, TeamFlag };
