import { useEffect } from "react";
import { toast } from "sonner";

type ActionResult = { success: boolean; error?: string } | null | undefined;

interface UseActionToastOptions<T extends ActionResult> {
	successMessage: string | ((result: T & { success: true }) => string);
}

export function useActionToast<T extends ActionResult>(
	result: T,
	options: UseActionToastOptions<T>,
) {
	useEffect(() => {
		if (!result) return;

		if (result.success) {
			const message =
				typeof options.successMessage === "function"
					? options.successMessage(result as T & { success: true })
					: options.successMessage;
			toast.success(message);
		} else {
			toast.error(result.error);
		}
	}, [result]);
}
