import { Skeleton } from "@world-cup/ui/components/skeleton";

export default function Loading() {
	return (
		<div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">
			<Skeleton className="mb-5 h-9 w-40" />
			<div className="mb-5 flex flex-wrap gap-2">
				<Skeleton className="h-7 w-16 rounded-full" />
				<Skeleton className="h-7 w-20 rounded-full" />
				<Skeleton className="h-7 w-20 rounded-full" />
				<Skeleton className="h-7 w-20 rounded-full" />
				<Skeleton className="h-7 w-20 rounded-full" />
				<Skeleton className="h-7 w-20 rounded-full" />
			</div>
			<Skeleton className="mb-3 h-9 w-full max-w-xs rounded-lg" />
			<div className="flex flex-col gap-2">
				<Skeleton className="h-[60px] rounded-lg" />
				<Skeleton className="h-[60px] rounded-lg" />
				<Skeleton className="h-[60px] rounded-lg" />
				<Skeleton className="h-[60px] rounded-lg" />
				<Skeleton className="h-[60px] rounded-lg" />
				<Skeleton className="h-[60px] rounded-lg" />
			</div>
		</div>
	);
}
