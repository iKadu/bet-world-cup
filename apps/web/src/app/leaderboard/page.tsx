import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@world-cup/ui/components/table";
import { getLeaderboard } from "@/lib/ranking";

export default async function LeaderboardPage() {
	const rows = await getLeaderboard();

	return (
		<div className="container mx-auto max-w-2xl px-4 py-6">
			<h1 className="mb-4 font-medium text-lg">Ranking</h1>
			{rows.length === 0 ? (
				<p className="py-8 text-center text-muted-foreground text-sm">
					Ainda não há usuários cadastrados.
				</p>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>#</TableHead>
							<TableHead>Usuário</TableHead>
							<TableHead>Placares exatos</TableHead>
							<TableHead>Pontos</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((row, index) => (
							<TableRow key={row.userId}>
								<TableCell>{index + 1}</TableCell>
								<TableCell>{row.name}</TableCell>
								<TableCell>{row.exactCount}</TableCell>
								<TableCell>{row.totalPoints}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</div>
	);
}
