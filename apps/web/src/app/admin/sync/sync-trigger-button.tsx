"use client";

import { Button } from "@world-cup/ui/components/button";
import { useActionToast } from "@world-cup/ui/hooks/use-action-toast";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { triggerManualSync } from "./actions";

export function SyncTriggerButton() {
	const t = useTranslations("AdminSync");
	const [isPending, startTransition] = useTransition();
	const [result, setResult] = useState<Awaited<
		ReturnType<typeof triggerManualSync>
	> | null>(null);

	useActionToast(result, {
		successMessage: (r) =>
			t("triggerSuccess", {
				updated: r.matchesUpserted,
				finalized: r.matchesFinalized,
			}),
	});

	function handleClick() {
		startTransition(async () => {
			setResult(await triggerManualSync());
		});
	}

	return (
		<Button
			onClick={handleClick}
			disabled={isPending}
			className="font-display uppercase tracking-wide"
		>
			↻ {isPending ? t("triggering") : t("triggerButton")}
		</Button>
	);
}
