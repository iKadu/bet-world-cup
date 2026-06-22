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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function SignUpPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const name = String(formData.get("name"));
		const email = String(formData.get("email"));
		const password = String(formData.get("password"));

		setIsLoading(true);
		const { error } = await authClient.signUp.email({ name, email, password });
		setIsLoading(false);

		if (error) {
			toast.error(error.message ?? "Não foi possível criar sua conta.");
			return;
		}

		toast.success("Conta criada com sucesso!");
		router.push("/");
		router.refresh();
	}

	return (
		<div className="container mx-auto flex max-w-sm flex-col justify-center px-4 py-12">
			<Card>
				<CardHeader>
					<CardTitle>Criar conta</CardTitle>
					<CardDescription>
						Cadastre-se para começar a dar seus palpites.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="grid gap-4">
						<div className="grid gap-1.5">
							<Label htmlFor="name">Nome</Label>
							<Input id="name" name="name" required autoComplete="name" />
						</div>
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
								minLength={8}
								autoComplete="new-password"
							/>
						</div>
						<Button type="submit" disabled={isLoading} className="mt-2">
							{isLoading ? "Criando conta..." : "Criar conta"}
						</Button>
					</form>
					<p className="mt-4 text-center text-muted-foreground text-xs">
						Já tem uma conta?{" "}
						<Link href="/sign-in" className="text-foreground underline">
							Entrar
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
