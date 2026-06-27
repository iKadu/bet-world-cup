import type { ServerSession } from "@world-cup/auth/server";
import type { ReactNode } from "react";
import { MobileNav } from "./mobile-nav";

interface TopbarProps {
	eyebrow: string;
	title: string;
	session: ServerSession;
	children?: ReactNode;
}

export function Topbar({ eyebrow, title, session, children }: TopbarProps) {
	return (
		<header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-background/95 px-5 py-4 backdrop-blur sm:px-8">
			<div className="flex items-center gap-3">
				<MobileNav session={session} />
				<div>
					<p className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
						{eyebrow}
					</p>
					<h1 className="font-display font-extrabold text-2xl">{title}</h1>
				</div>
			</div>
			{children && (
				<div className="flex shrink-0 items-center gap-3">{children}</div>
			)}
		</header>
	);
}
