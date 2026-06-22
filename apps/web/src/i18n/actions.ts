"use server";

import { cookies } from "next/headers";
import type { Locale } from "./config";
import { LOCALE_COOKIE } from "./request";

export async function setLocale(locale: Locale) {
	const store = await cookies();
	store.set(LOCALE_COOKIE, locale, { maxAge: 60 * 60 * 24 * 365 });
}
