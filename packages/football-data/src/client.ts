import { env } from "@world-cup/env/server";
import { competitionMatchesResponseSchema } from "./types";

const BASE_URL = "https://api.football-data.org/v4";
const WORLD_CUP_COMPETITION_CODE = "WC";

export async function fetchWorldCupMatches() {
	const response = await fetch(
		`${BASE_URL}/competitions/${WORLD_CUP_COMPETITION_CODE}/matches`,
		{
			headers: { "X-Auth-Token": env.FOOTBALL_DATA_API_KEY },
		},
	);

	if (!response.ok) {
		throw new Error(
			`football-data.org request failed: ${response.status} ${response.statusText}`,
		);
	}

	const json = await response.json();
	return competitionMatchesResponseSchema.parse(json).matches;
}
