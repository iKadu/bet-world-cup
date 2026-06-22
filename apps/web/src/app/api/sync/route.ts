import { env } from "@world-cup/env/server";
import { type NextRequest, NextResponse } from "next/server";
import { runSync } from "@/lib/sync";

async function handleSync(request: NextRequest) {
	const authHeader = request.headers.get("authorization");

	if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const result = await runSync({ triggeredBy: "CRON" });
	return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export { handleSync as GET, handleSync as POST };
