"use client";

import { authClient } from "@world-cup/auth/client";
import { Button } from "@world-cup/ui/components/button";
import { Input } from "@world-cup/ui/components/input";
import { Label } from "@world-cup/ui/components/label";
import { PasswordInput } from "@world-cup/ui/components/password-input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "../auth-shell";

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
		<AuthShell
			title="Entre na mesa"
			subtitle="Cadastre-se para começar a dar seus palpites."
			footer={
				<>
					Já tem uma conta?{" "}
					<Link href="/sign-in" className="text-accent-text underline">
						Entrar
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
						Nome
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
						Email
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
						Senha
					</Label>
					<PasswordInput
						id="password"
						name="password"
						required
						minLength={8}
						autoComplete="new-password"
						className="h-12 rounded-lg"
					/>
					<span className="font-mono text-[10px] text-muted-foreground">
						8+ caracteres
					</span>
				</div>
				<Button
					type="submit"
					size="lg"
					disabled={isLoading}
					className="mt-2 w-full font-display text-base uppercase tracking-wide"
				>
					{isLoading ? "Criando conta..." : "Criar conta"}
				</Button>
			</form>
		</AuthShell>
	);
}
