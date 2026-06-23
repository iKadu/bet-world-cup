"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@world-cup/ui/lib/utils";

function Sheet({ ...props }: DialogPrimitive.Root.Props) {
	return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
	return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetPortal({ ...props }: DialogPrimitive.Portal.Props) {
	return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetBackdrop({
	className,
	...props
}: DialogPrimitive.Backdrop.Props) {
	return (
		<DialogPrimitive.Backdrop
			data-slot="sheet-backdrop"
			className={cn(
				"data-open:fade-in-0 data-closed:fade-out-0 fixed inset-0 z-50 bg-black/60 data-closed:animate-out data-open:animate-in",
				className,
			)}
			{...props}
		/>
	);
}

function SheetContent({
	className,
	children,
	...props
}: DialogPrimitive.Popup.Props) {
	return (
		<SheetPortal>
			<SheetBackdrop />
			<DialogPrimitive.Popup
				data-slot="sheet-content"
				className={cn(
					"data-open:slide-in-from-right data-closed:slide-out-to-right fixed inset-y-0 right-0 z-50 flex h-full w-[280px] flex-col gap-1 border-l bg-card px-5 py-5 shadow-lg outline-none data-closed:animate-out data-open:animate-in data-closed:duration-150 data-open:duration-200",
					className,
				)}
				{...props}
			>
				{children}
			</DialogPrimitive.Popup>
		</SheetPortal>
	);
}

function SheetClose({ ...props }: DialogPrimitive.Close.Props) {
	return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
	return (
		<DialogPrimitive.Title
			data-slot="sheet-title"
			className={cn("font-bold font-display text-base", className)}
			{...props}
		/>
	);
}

export {
	Sheet,
	SheetBackdrop,
	SheetClose,
	SheetContent,
	SheetPortal,
	SheetTitle,
	SheetTrigger,
};
