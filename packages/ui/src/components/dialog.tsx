"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@world-cup/ui/lib/utils";

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogBackdrop({
	className,
	...props
}: DialogPrimitive.Backdrop.Props) {
	return (
		<DialogPrimitive.Backdrop
			data-slot="dialog-backdrop"
			className={cn(
				"data-open:fade-in-0 data-closed:fade-out-0 fixed inset-0 z-50 bg-black/60 data-closed:animate-out data-open:animate-in",
				className,
			)}
			{...props}
		/>
	);
}

function DialogPopup({ className, ...props }: DialogPrimitive.Popup.Props) {
	return (
		<DialogPrimitive.Popup
			data-slot="dialog-popup"
			className={cn(
				"data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 fixed inset-x-0 top-[15vh] z-50 mx-auto w-full max-w-lg rounded-xl border bg-popover text-popover-foreground shadow-2xl outline-none data-closed:animate-out data-open:animate-in",
				className,
			)}
			{...props}
		/>
	);
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export {
	Dialog,
	DialogBackdrop,
	DialogClose,
	DialogPopup,
	DialogPortal,
	DialogTrigger,
};
