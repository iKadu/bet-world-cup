import type { FootballDataMatch } from "./types";

export interface MappedGroup {
	id: string;
	name: string;
}

export interface MappedTeam {
	id: string;
	name: string;
	shortName: string | null;
	tla: string | null;
	crestUrl: string | null;
	groupId: string | null;
}

export interface MappedMatch {
	id: string;
	stage: FootballDataMatch["stage"];
	groupId: string | null;
	matchday: number | null;
	homeTeamId: string | null;
	awayTeamId: string | null;
	kickoff: Date;
	status: FootballDataMatch["status"];
	homeScore: number | null;
	awayScore: number | null;
	winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
}

export interface MappedTournamentData {
	groups: MappedGroup[];
	teams: MappedTeam[];
	matches: MappedMatch[];
}

function normalizeGroupId(rawGroup: string | null): string | null {
	if (!rawGroup) return null;
	const lastToken = rawGroup.match(/([A-Za-z0-9]+)$/)?.[1] ?? rawGroup;
	return lastToken.toUpperCase();
}

export function mapWorldCupMatches(
	rawMatches: FootballDataMatch[],
): MappedTournamentData {
	const groupsById = new Map<string, MappedGroup>();
	const teamsById = new Map<string, MappedTeam>();
	const matches: MappedMatch[] = [];

	for (const raw of rawMatches) {
		const groupId = normalizeGroupId(raw.group);

		if (groupId && !groupsById.has(groupId)) {
			groupsById.set(groupId, { id: groupId, name: `Group ${groupId}` });
		}

		for (const team of [raw.homeTeam, raw.awayTeam]) {
			if (team.id === null) continue;
			const teamId = String(team.id);
			const existing = teamsById.get(teamId);
			teamsById.set(teamId, {
				id: teamId,
				name: team.name ?? existing?.name ?? teamId,
				shortName: team.shortName ?? existing?.shortName ?? null,
				tla: team.tla ?? existing?.tla ?? null,
				crestUrl: team.crest ?? existing?.crestUrl ?? null,
				groupId: groupId ?? existing?.groupId ?? null,
			});
		}

		matches.push({
			id: String(raw.id),
			stage: raw.stage,
			groupId,
			matchday: raw.matchday,
			homeTeamId: raw.homeTeam.id !== null ? String(raw.homeTeam.id) : null,
			awayTeamId: raw.awayTeam.id !== null ? String(raw.awayTeam.id) : null,
			kickoff: new Date(raw.utcDate),
			status: raw.status,
			homeScore: raw.score.fullTime.home,
			awayScore: raw.score.fullTime.away,
			winner: raw.score.winner,
		});
	}

	return {
		groups: [...groupsById.values()],
		teams: [...teamsById.values()],
		matches,
	};
}
