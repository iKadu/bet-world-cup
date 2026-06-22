"use server";

import { auth } from "@world-cup/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { runSync } from "@/lib/sync";

export async function triggerManualSync() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (session?.user.role !== "admin") {
		const t = await getTranslations("AdminSync");
		return { success: false as const, error: t("accessDenied") };
	}

	const result = await runSync({
		triggeredBy: "MANUAL",
		triggeredByUserId: session.user.id,
	});

	revalidatePath("/admin/sync");

	return result;
}
