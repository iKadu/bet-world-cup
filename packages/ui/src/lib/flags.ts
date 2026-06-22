/**
 * Maps each FIFA World Cup 2026 squad's 3-letter TLA (as stored on `teams.tla`)
 * to the country code used by the `flag-icons` SVG set. England and Scotland
 * use flag-icons' UK subdivision codes since they have no ISO 3166-1 code of
 * their own.
 */
const COUNTRY_CODE_BY_TLA: Record<string, string> = {
	ALG: "dz", // Algeria
	ARG: "ar", // Argentina
	AUS: "au", // Australia
	AUT: "at", // Austria
	BEL: "be", // Belgium
	BIH: "ba", // Bosnia-Herzegovina
	BRA: "br", // Brazil
	CAN: "ca", // Canada
	CIV: "ci", // Ivory Coast
	COD: "cd", // Congo DR
	COL: "co", // Colombia
	CPV: "cv", // Cape Verde Islands
	CRO: "hr", // Croatia
	CUW: "cw", // Curaçao
	CZE: "cz", // Czechia
	ECU: "ec", // Ecuador
	EGY: "eg", // Egypt
	ENG: "gb-eng", // England
	ESP: "es", // Spain
	FRA: "fr", // France
	GER: "de", // Germany
	GHA: "gh", // Ghana
	HAI: "ht", // Haiti
	IRN: "ir", // Iran
	IRQ: "iq", // Iraq
	JOR: "jo", // Jordan
	JPN: "jp", // Japan
	KOR: "kr", // South Korea
	KSA: "sa", // Saudi Arabia
	MAR: "ma", // Morocco
	MEX: "mx", // Mexico
	NED: "nl", // Netherlands
	NOR: "no", // Norway
	NZL: "nz", // New Zealand
	PAN: "pa", // Panama
	PAR: "py", // Paraguay
	POR: "pt", // Portugal
	QAT: "qa", // Qatar
	RSA: "za", // South Africa
	SCO: "gb-sct", // Scotland
	SEN: "sn", // Senegal
	SUI: "ch", // Switzerland
	SWE: "se", // Sweden
	TUN: "tn", // Tunisia
	TUR: "tr", // Turkey
	URU: "uy", // Uruguay
	USA: "us", // United States
	UZB: "uz", // Uzbekistan
};

export function getCountryCode(tla: string | null | undefined): string | null {
	if (!tla) return null;
	return COUNTRY_CODE_BY_TLA[tla.toUpperCase()] ?? null;
}
