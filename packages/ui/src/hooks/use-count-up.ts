import { useEffect, useRef, useState } from "react";

export function useCountUp(value: number, durationMs = 600): number {
	const [displayValue, setDisplayValue] = useState(value);
	const previousValueRef = useRef(value);

	useEffect(() => {
		const startValue = previousValueRef.current;
		const endValue = value;
		previousValueRef.current = value;

		if (startValue === endValue) {
			setDisplayValue(endValue);
			return;
		}

		let frameId: number;
		const startTime = performance.now();

		function tick() {
			const elapsed = performance.now() - startTime;
			const progress = Math.min(elapsed / durationMs, 1);
			setDisplayValue(
				Math.round(startValue + (endValue - startValue) * progress),
			);

			if (progress < 1) {
				frameId = requestAnimationFrame(tick);
			}
		}

		frameId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frameId);
	}, [value, durationMs]);

	return displayValue;
}
