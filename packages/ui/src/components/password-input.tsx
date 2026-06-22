"use client";

import { Input } from "@world-cup/ui/components/input";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type * as React from "react";
import { useState } from "react";

function PasswordInput({
	className,
	...props
}: React.ComponentProps<typeof Input>) {
	const t = useTranslations("PasswordInput");
	const [visible, setVisible] = useState(false);

	return (
		<div className="relative">
			<Input
				type={visible ? "text" : "password"}
				className={className}
				{...props}
			/>
			<button
				type="button"
				onClick={() => setVisible((value) => !value)}
				aria-label={visible ? t("hide") : t("show")}
				className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
			>
				{visible ? (
					<EyeOffIcon className="size-4" />
				) : (
					<EyeIcon className="size-4" />
				)}
			</button>
		</div>
	);
}

export { PasswordInput };
