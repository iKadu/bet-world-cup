"use server";

import { getServerSession } from "@world-cup/auth/server";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { runSync } from "@/lib/sync";

export async function triggerManualSync() {
	const session = await getServerSession();

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
