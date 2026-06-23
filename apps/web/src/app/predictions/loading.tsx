import { Skeleton } from "@world-cup/ui/components/skeleton";

export default function Loading() {
	return (
		<div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">
			<Skeleton className="mb-6 h-[120px] rounded-xl" />
			<div className="flex flex-col gap-2">
				<Skeleton className="h-14 rounded-lg" />
				<Skeleton className="h-14 rounded-lg" />
				<Skeleton className="h-14 rounded-lg" />
				<Skeleton className="h-14 rounded-lg" />
				<Skeleton className="h-14 rounded-lg" />
				<Skeleton className="h-14 rounded-lg" />
			</div>
		</div>
	);
}
