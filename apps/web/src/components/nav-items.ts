import {
	CalendarDaysIcon,
	ClipboardListIcon,
	GitCompareIcon,
	HomeIcon,
	SettingsIcon,
	TrophyIcon,
} from "lucide-react";
import type { Route } from "next";
import type { useTranslations } from "next-intl";

export interface NavItem {
	href: Route;
	label: string;
	icon: typeof HomeIcon;
	count?: number;
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

type HeaderTranslator = ReturnType<typeof useTranslations>;

export function getNavGroups(
	t: HeaderTranslator,
	isAdmin: boolean,
	counts: { matches?: number; predictions?: number },
): NavGroup[] {
	const groups: NavGroup[] = [
		{
			label: t("navGroupMenu"),
			items: [
				{ href: "/", label: t("navHome"), icon: HomeIcon },
				{
					href: "/matches",
					label: t("navMatches"),
					icon: CalendarDaysIcon,
					count: counts.matches,
				},
				{
					href: "/predictions",
					label: t("myPredictions"),
					icon: ClipboardListIcon,
					count: counts.predictions,
				},
			],
		},
		{
			label: t("navGroupCompete"),
			items: [
				{ href: "/leaderboard", label: t("navRanking"), icon: TrophyIcon },
				{ href: "/compare", label: t("navCompare"), icon: GitCompareIcon },
			],
		},
	];

	if (isAdmin) {
		groups.push({
			label: t("navGroupAdmin"),
			items: [
				{ href: "/admin/sync", label: t("adminSync"), icon: SettingsIcon },
			],
		});
	}

	return groups;
}

export function getFlatNavItems(
	t: HeaderTranslator,
	isAdmin: boolean,
): NavItem[] {
	return getNavGroups(t, isAdmin, {}).flatMap((group) => group.items);
}
