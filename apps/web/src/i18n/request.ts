import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, type Locale, locales } from "./config";

export const LOCALE_COOKIE = "locale";

export default getRequestConfig(async () => {
	const store = await cookies();
	const cookieLocale = store.get(LOCALE_COOKIE)?.value;
	const locale: Locale = locales.includes(cookieLocale as Locale)
		? (cookieLocale as Locale)
		: defaultLocale;

	return {
		locale,
		messages: (await import(`../../messages/${locale}.json`)).default,
	};
});
