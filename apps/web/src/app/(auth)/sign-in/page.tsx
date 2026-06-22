"use client";

import { authClient } from "@world-cup/auth/client";
import { Button } from "@world-cup/ui/components/button";
import { Input } from "@world-cup/ui/components/input";
import { Label } from "@world-cup/ui/components/label";
import { PasswordInput } from "@world-cup/ui/components/password-input";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "../auth-shell";

export default function SignInPage() {
	return (
		<Suspense>
			<SignInForm />
		</Suspense>
	);
}

function SignInForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const t = useTranslations("SignIn");
	const tAuth = useTranslations("Auth");
	const [isLoading, setIsLoading] = useState(false);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const email = String(formData.get("email"));
		const password = String(formData.get("password"));

		setIsLoading(true);
		const { error } = await authClient.signIn.email({ email, password });
		setIsLoading(false);

		if (error) {
			toast.error(error.message ?? t("invalidCredentials"));
			return;
		}

		router.push((searchParams.get("redirect") ?? "/") as Route);
		router.refresh();
	}

	return (
		<AuthShell
			title={t("title")}
			subtitle={t("subtitle")}
			footer={
				<>
					{t("noAccount")}{" "}
					<Link href="/sign-up" className="text-accent-text underline">
						{t("signUpLink")}
					</Link>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="grid gap-4">
				<div className="grid gap-1.5">
					<Label
						htmlFor="email"
						className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest"
					>
						{tAuth("emailLabel")}
					</Label>
					<Input
						id="email"
						name="email"
						type="email"
						required
						autoComplete="email"
						className="h-12 rounded-lg"
					/>
				</div>
				<div className="grid gap-1.5">
					<Label
						htmlFor="password"
						className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest"
					>
						{tAuth("passwordLabel")}
					</Label>
					<PasswordInput
						id="password"
						name="password"
						required
						autoComplete="current-password"
						className="h-12 rounded-lg"
					/>
				</div>
				<Button
					type="submit"
					size="lg"
					disabled={isLoading}
					className="mt-2 w-full font-display text-base uppercase tracking-wide"
				>
					{isLoading ? t("submitting") : t("submit")}
				</Button>
			</form>
		</AuthShell>
	);
}
