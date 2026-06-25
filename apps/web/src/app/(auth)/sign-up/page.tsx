"use client";

import { authClient } from "@world-cup/auth/client";
import { Button } from "@world-cup/ui/components/button";
import { Input } from "@world-cup/ui/components/input";
import { Label } from "@world-cup/ui/components/label";
import { PasswordInput } from "@world-cup/ui/components/password-input";
import { cn } from "@world-cup/ui/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "../auth-shell";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export default function SignUpPage() {
	const router = useRouter();
	const t = useTranslations("SignUp");
	const tAuth = useTranslations("Auth");
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const isEmailValid = email === "" || EMAIL_PATTERN.test(email);
	const isPasswordValid = password.length >= MIN_PASSWORD_LENGTH;

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const name = String(formData.get("name"));

		setIsLoading(true);
		const { error } = await authClient.signUp.email({ name, email, password });
		setIsLoading(false);

		if (error) {
			toast.error(error.message ?? t("error"));
			return;
		}

		toast.success(t("success"));
		router.push("/");
		router.refresh();
	}

	return (
		<AuthShell
			title={t("title")}
			subtitle={t("subtitle")}
			footer={
				<>
					{t("hasAccount")}{" "}
					<Link href="/sign-in" className="text-accent-text underline">
						{t("signInLink")}
					</Link>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="grid gap-4">
				<div className="grid gap-1.5">
					<Label
						htmlFor="name"
						className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest"
					>
						{t("nameLabel")}
					</Label>
					<Input
						id="name"
						name="name"
						required
						autoComplete="name"
						className="h-12 rounded-lg"
					/>
				</div>
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
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						aria-invalid={email !== "" && !isEmailValid}
						className="h-12 rounded-lg"
					/>
					{email !== "" && !isEmailValid && (
						<span className="font-mono text-[10px] text-destructive">
							{t("emailInvalid")}
						</span>
					)}
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
						minLength={8}
						autoComplete="new-password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						aria-invalid={password !== "" && !isPasswordValid}
						className="h-12 rounded-lg"
					/>
					<span
						className={cn(
							"font-mono text-[10px]",
							password === ""
								? "text-muted-foreground"
								: isPasswordValid
									? "text-accent-text"
									: "text-destructive",
						)}
					>
						{password === ""
							? t("passwordHint")
							: t("passwordHintProgress", { count: password.length })}
					</span>
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
