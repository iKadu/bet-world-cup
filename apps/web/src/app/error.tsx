"use client";

import { Button } from "@world-cup/ui/components/button";
import { Card, CardContent } from "@world-cup/ui/components/card";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function RouteError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const t = useTranslations("ErrorBoundary");

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="mx-auto flex max-w-4xl flex-col items-center px-5 py-20 text-center sm:px-7">
			<Card className="max-w-md p-8">
				<CardContent className="flex flex-col items-center gap-4">
					<span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
						{t("eyebrow")}
					</span>
					<h1 className="font-display font-extrabold text-2xl">{t("title")}</h1>
					<p className="text-muted-foreground text-sm">{t("description")}</p>
					<Button onClick={reset} className="mt-2">
						{t("retry")}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
