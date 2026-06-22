import { auth } from "@world-cup/auth";
import { Avatar, AvatarFallback } from "@world-cup/ui/components/avatar";
import { cn } from "@world-cup/ui/lib/utils";
import { headers } from "next/headers";
import { getLeaderboard, type LeaderboardRow } from "@/lib/ranking";

function getInitials(name: string) {
	const initials = name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0] ?? "")
		.join("");

	return initials.toUpperCase() || "?";
}

export default async function LeaderboardPage() {
	const session = await auth.api.getSession({ headers: await headers() });
	const rows = await getLeaderboard();
	const podium = [rows[1], rows[0], rows[2]];

	return (
		<div className="mx-auto max-w-4xl px-5 py-8 sm:px-7">
			<h1 className="font-display font-extrabold text-3xl">Ranking global</h1>
			<p className="mb-6 font-mono text-muted-foreground text-xs uppercase tracking-wide">
				{rows.length} {rows.length === 1 ? "participante" : "participantes"} ·
				uma única tabela
			</p>

			{rows.length === 0 ? (
				<p className="py-10 text-center text-muted-foreground text-sm">
					Ainda não há usuários cadastrados.
				</p>
			) : (
				<>
					{rows.length >= 2 && (
						<div className="mb-8 grid grid-cols-3 items-end gap-3 sm:gap-4">
							{podium.map((entry, index) => {
								if (!entry) return <div key={`empty-${index}`} />;
								const rank = index === 0 ? 2 : index === 1 ? 1 : 3;
								return (
									<PodiumCard
										key={entry.userId}
										entry={entry}
										rank={rank}
										emphasized={rank === 1}
									/>
								);
							})}
						</div>
					)}

					<div className="overflow-hidden rounded-xl border">
						<div className="grid grid-cols-[60px_1fr_120px_120px] gap-3 border-b bg-surface-row px-5 py-2.5 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
							<span>Pos</span>
							<span>Jogador</span>
							<span>Exatos</span>
							<span className="text-right">Pontos</span>
						</div>
						{rows.map((row, index) => (
							<LeaderboardRowItem
								key={row.userId}
								row={row}
								position={index + 1}
								isYou={row.userId === session?.user.id}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}

function PodiumCard({
	entry,
	rank,
	emphasized,
}: {
	entry: LeaderboardRow;
	rank: 1 | 2 | 3;
	emphasized: boolean;
}) {
	const rankColor =
		rank === 2
			? "text-[#c8cdd6]"
			: rank === 3
				? "text-[#cd8b54]"
				: "text-accent-text";

	return (
		<div
			className={cn(
				"flex flex-col items-center gap-2 rounded-xl border px-4 py-5 text-center",
				emphasized
					? "border-accent-lime/35 bg-card pb-7 shadow-[0_0_0_1px_rgba(194,242,61,.1),0_20px_50px_-20px_rgba(194,242,61,.18)]"
					: "border-border bg-card/60",
			)}
		>
			{emphasized && (
				<span className="font-mono text-[10px] text-accent-text uppercase tracking-widest">
					★ Líder
				</span>
			)}
			<Avatar size={emphasized ? "lg" : "default"}>
				<AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 font-bold font-display text-primary-foreground">
					{getInitials(entry.name)}
				</AvatarFallback>
			</Avatar>
			<span className="font-display font-semibold text-sm">{entry.name}</span>
			<span
				className={cn(
					"font-bold font-mono",
					emphasized ? "text-4xl text-accent-text" : `text-2xl ${rankColor}`,
				)}
			>
				{entry.totalPoints}
			</span>
			<span className="font-mono text-[11px] text-muted-foreground">
				{entry.exactCount} placares exatos
			</span>
		</div>
	);
}

function LeaderboardRowItem({
	row,
	position,
	isYou,
}: {
	row: LeaderboardRow;
	position: number;
	isYou: boolean;
}) {
	return (
		<div
			className={cn(
				"grid grid-cols-[60px_1fr_120px_120px] items-center gap-3 border-b px-5 py-3 last:border-b-0",
				isYou && "bg-points-exact-bg",
			)}
		>
			<span className="font-bold font-mono text-sm">{position}</span>
			<span className="flex items-center gap-2">
				<Avatar size="sm">
					<AvatarFallback className="bg-gradient-to-br from-primary to-primary/50 font-bold font-display text-[10px] text-primary-foreground">
						{getInitials(row.name)}
					</AvatarFallback>
				</Avatar>
				<span className="font-display font-semibold text-sm">{row.name}</span>
				{isYou && (
					<span className="rounded-full bg-accent-lime/15 px-2 py-0.5 font-mono text-[10px] text-accent-text uppercase">
						Você
					</span>
				)}
			</span>
			<span className="font-mono text-muted-foreground text-sm">
				{row.exactCount}
			</span>
			<span
				className={cn(
					"text-right font-bold font-mono text-sm",
					isYou && "text-accent-text",
				)}
			>
				{row.totalPoints}
			</span>
		</div>
	);
}
