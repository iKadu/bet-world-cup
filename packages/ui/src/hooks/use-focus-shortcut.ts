import type { RefObject } from "react";
import { useEffect } from "react";

export function useFocusShortcut(
	key: string,
	targetRef: RefObject<HTMLElement | null>,
) {
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key !== key) return;

			const active = document.activeElement;
			const isTyping =
				active instanceof HTMLInputElement ||
				active instanceof HTMLTextAreaElement ||
				active?.getAttribute("contenteditable") === "true";
			if (isTyping) return;

			event.preventDefault();
			targetRef.current?.focus();
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [key, targetRef]);
}
