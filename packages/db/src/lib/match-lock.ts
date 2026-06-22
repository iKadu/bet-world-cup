const OPEN_STATUSES = new Set(["SCHEDULED", "TIMED"]);

export function isMatchLocked(match: {
	kickoff: Date;
	status: string;
}): boolean {
	if (!OPEN_STATUSES.has(match.status)) {
		return true;
	}

	return new Date() >= match.kickoff;
}
