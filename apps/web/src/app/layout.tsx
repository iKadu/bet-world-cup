import type { Metadata } from "next";
import { JetBrains_Mono, Saira, Saira_Condensed } from "next/font/google";

import "../index.css";
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

export const metadata: Metadata = {
	title: "WC26 Predictor",
	description: "World Cup 2026 prediction pool",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${sairaCondensed.variable} ${saira.variable} ${jetBrainsMono.variable} antialiased`}
			>
				<Providers>
					<div className="grid min-h-svh grid-rows-[auto_1fr] bg-background">
						<Header />
						{children}
					</div>
				</Providers>
			</body>
		</html>
	);
}
