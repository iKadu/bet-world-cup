"use client";

import { authClient } from "@world-cup/auth/client";
import { Button } from "@world-cup/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@world-cup/ui/components/card";
import { Input } from "@world-cup/ui/components/input";
import { Label } from "@world-cup/ui/components/label";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

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
			toast.error(error.message ?? "Email ou senha inválidos.");
			return;
		}

		router.push((searchParams.get("redirect") ?? "/") as Route);
		router.refresh();
	}

	return (
		<div className="container mx-auto flex max-w-sm flex-col justify-center px-4 py-12">
			<Card>
				<CardHeader>
					<CardTitle>Entrar</CardTitle>
					<CardDescription>Acesse sua conta do bolão.</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="grid gap-4">
						<div className="grid gap-1.5">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								required
								autoComplete="email"
							/>
						</div>
						<div className="grid gap-1.5">
							<Label htmlFor="password">Senha</Label>
							<Input
								id="password"
								name="password"
								type="password"
								required
								autoComplete="current-password"
							/>
						</div>
						<Button type="submit" disabled={isLoading} className="mt-2">
							{isLoading ? "Entrando..." : "Entrar"}
						</Button>
					</form>
					<p className="mt-4 text-center text-muted-foreground text-xs">
						Ainda não tem conta?{" "}
						<Link href="/sign-up" className="text-foreground underline">
							Cadastre-se
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
