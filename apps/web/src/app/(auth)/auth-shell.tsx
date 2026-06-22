import type { ReactNode } from "react";

interface AuthShellProps {
	title: string;
	subtitle: string;
	children: ReactNode;
	footer: ReactNode;
}

export function AuthShell({
	title,
	subtitle,
	children,
	footer,
}: AuthShellProps) {
	return (
		<div className="relative flex min-h-[calc(100svh-70px)] items-center justify-center overflow-hidden px-4 py-12">
			<div className="pointer-events-none absolute top-0 left-1/2 size-96 -translate-x-1/2 rounded-full bg-accent-lime/10 blur-3xl" />
			<div className="relative w-full max-w-[368px]">
				<div className="mb-6 flex flex-col items-center gap-3 text-center">
					<span className="flex size-9 -skew-x-[7deg] items-center justify-center rounded-md bg-primary font-display font-extrabold text-primary-foreground">
						W
					</span>
					<div>
						<h1 className="font-display font-extrabold text-3xl uppercase">
							{title}
						</h1>
						<p className="mt-1 text-muted-foreground text-sm">{subtitle}</p>
					</div>
				</div>
				<div className="rounded-xl border bg-card p-6">{children}</div>
				<div className="mt-4 text-center text-muted-foreground text-xs">
					{footer}
				</div>
			</div>
		</div>
	);
}
