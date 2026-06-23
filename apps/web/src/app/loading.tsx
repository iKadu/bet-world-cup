import { Skeleton } from "@world-cup/ui/components/skeleton";

export default function Loading() {
	return (
		<div>
			<section className="border-b px-5 py-10 sm:px-7">
				<div className="mx-auto max-w-4xl">
					<Skeleton className="h-3 w-40" />
					<Skeleton className="mt-3 h-10 w-2/3" />
				</div>
			</section>
			<div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">
				<div className="mb-6 grid gap-4 sm:grid-cols-[1.3fr_1fr]">
					<Skeleton className="h-32 rounded-xl" />
					<Skeleton className="h-32 rounded-xl" />
				</div>
				<Skeleton className="mb-3 h-6 w-48" />
				<div className="flex flex-col gap-2">
					<Skeleton className="h-16 rounded-lg" />
					<Skeleton className="h-16 rounded-lg" />
					<Skeleton className="h-16 rounded-lg" />
				</div>
			</div>
		</div>
	);
}
