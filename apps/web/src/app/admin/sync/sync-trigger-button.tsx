"use client";

import { Button } from "@world-cup/ui/components/button";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { triggerManualSync } from "./actions";

export function SyncTriggerButton() {
	const t = useTranslations("AdminSync");
	const [isPending, startTransition] = useTransition();

	function handleClick() {
		startTransition(async () => {
			const result = await triggerManualSync();

			if (result.success) {
				toast.success(
					t("triggerSuccess", {
						updated: result.matchesUpserted,
						finalized: result.matchesFinalized,
					}),
				);
			} else {
				toast.error(result.error);
			}
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
