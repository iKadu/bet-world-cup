import { Skeleton } from "@world-cup/ui/components/skeleton";

export default function Loading() {
	return (
		<div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">
			<Skeleton className="mb-2 h-9 w-56" />
			<Skeleton className="mb-6 h-3 w-72" />
			<div className="flex flex-col gap-4">
				<Skeleton className="h-40 rounded-xl" />
				<Skeleton className="h-40 rounded-xl" />
				<Skeleton className="h-40 rounded-xl" />
			</div>
		</div>
	);
}
