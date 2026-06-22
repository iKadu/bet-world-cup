"use client";

import { Button } from "@world-cup/ui/components/button";
import { useTransition } from "react";
import { toast } from "sonner";
import { triggerManualSync } from "./actions";

export function SyncTriggerButton() {
	const [isPending, startTransition] = useTransition();

	function handleClick() {
		startTransition(async () => {
			const result = await triggerManualSync();

			if (result.success) {
				toast.success(
					`Sync concluído: ${result.matchesUpserted} partidas atualizadas, ${result.matchesFinalized} finalizadas.`,
				);
			} else {
				toast.error(result.error);
			}
		});
	}

	return (
		<Button onClick={handleClick} disabled={isPending}>
			{isPending ? "Sincronizando..." : "Disparar sync manual"}
		</Button>
	);
}
