import { getServerSession } from "@world-cup/auth/server";
import { env } from "@world-cup/env/server";
import type { Metadata } from "next";
import { JetBrains_Mono, Saira, Saira_Condensed } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

import "../index.css";
import { CommandPalette } from "@/components/command-palette";
import Header from "@/components/header";
import Providers from "@/components/providers";

const sairaCondensed = Saira_Condensed({
	variable: "--font-display",
	weight: ["400", "500", "600", "700", "800"],
	subsets: ["latin"],
});

const saira = Saira({
	variable: "--font-sans",
	weight: ["400", "500", "600", "700"],
	subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
	variable: "--font-mono",
	weight: ["400", "500", "700", "800"],
	subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("Metadata");
	const locale = await getLocale();

	return {
		metadataBase: new URL(env.BETTER_AUTH_URL),
		title: { default: t("title"), template: `%s · ${t("title")}` },
		description: t("description"),
		openGraph: {
			title: t("title"),
			description: t("description"),
			siteName: t("title"),
			locale: locale === "pt" ? "pt_BR" : "en_US",
			type: "website",
			images: ["/opengraph-image"],
		},
		twitter: {
			card: "summary_large_image",
			title: t("title"),
			description: t("description"),
			images: ["/opengraph-image"],
		},
	};
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const locale = await getLocale();
	const session = await getServerSession();

	return (
		<html lang={locale} suppressHydrationWarning>
			<body
				className={`${sairaCondensed.variable} ${saira.variable} ${jetBrainsMono.variable} antialiased`}
			>
				<NextIntlClientProvider>
					<Providers>
						<div className="grid min-h-svh grid-rows-[auto_1fr] bg-background">
							<Header session={session} />
							{children}
						</div>
						<CommandPalette isAdmin={session?.user.role === "admin"} />
					</Providers>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
