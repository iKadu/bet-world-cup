"use server";

import { auth } from "@world-cup/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { runSync } from "@/lib/sync";

export async function triggerManualSync() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (session?.user.role !== "admin") {
		return { success: false as const, error: "Acesso negado." };
	}

	const result = await runSync({
		triggeredBy: "MANUAL",
		triggeredByUserId: session.user.id,
	});

	revalidatePath("/admin/sync");

	return result;
}
