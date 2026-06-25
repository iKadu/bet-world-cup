"use client";

import { Button } from "@world-cup/ui/components/button";
import { useEffect } from "react";
import "../index.css";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html lang="en">
			<body className="grid min-h-svh place-items-center bg-background antialiased">
				<div className="flex flex-col items-center gap-4 px-5 text-center">
					<h1 className="font-display font-extrabold text-2xl">
						Something went wrong
					</h1>
					<p className="text-muted-foreground text-sm">
						Please try again or come back later.
					</p>
					<Button onClick={reset}>Try again</Button>
				</div>
			</body>
		</html>
	);
}
