import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/predictions", "/admin"];

export function proxy(request: NextRequest) {
	const isProtected = PROTECTED_PATHS.some((path) =>
		request.nextUrl.pathname.startsWith(path),
	);

	if (!isProtected) {
		return NextResponse.next();
	}

	const sessionCookie = getSessionCookie(request);

	if (!sessionCookie) {
		const signInUrl = new URL("/sign-in", request.url);
		signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
		return NextResponse.redirect(signInUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/predictions/:path*", "/admin/:path*"],
};
