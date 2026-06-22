"use client";

import { authClient } from "@world-cup/auth/client";
import { Button } from "@world-cup/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@world-cup/ui/components/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ModeToggle } from "./mode-toggle";

export default function Header() {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	const links = [
		{ to: "/", label: "Home" },
		{ to: "/matches", label: "Partidas" },
		{ to: "/leaderboard", label: "Ranking" },
	] as const;

	async function handleSignOut() {
		await authClient.signOut();
		router.push("/");
		router.refresh();
	}

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					{links.map(({ to, label }) => {
						return (
							<Link key={to} href={to}>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					<ModeToggle />
					{session ? (
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<Button variant="ghost" size="sm">
										{session.user.name}
									</Button>
								}
							/>
							<DropdownMenuContent>
								<DropdownMenuLabel>{session.user.email}</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem render={<Link href="/predictions" />}>
									Minhas previsões
								</DropdownMenuItem>
								{session.user.role === "admin" ? (
									<DropdownMenuItem render={<Link href="/admin/sync" />}>
										Admin: Sync
									</DropdownMenuItem>
								) : null}
								<DropdownMenuSeparator />
								<DropdownMenuItem variant="destructive" onClick={handleSignOut}>
									Sair
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								render={<Link href="/sign-in" />}
							>
								Entrar
							</Button>
							<Button size="sm" render={<Link href="/sign-up" />}>
								Cadastrar
							</Button>
						</div>
					)}
				</div>
			</div>
			<hr />
		</div>
	);
}
