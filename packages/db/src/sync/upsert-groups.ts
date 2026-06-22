import { sql } from "drizzle-orm";
import { db } from "../index";
import { groups } from "../schema";

export interface UpsertGroupInput {
	id: string;
	name: string;
}

export async function upsertGroups(input: UpsertGroupInput[]) {
	if (input.length === 0) return;

	await db
		.insert(groups)
		.values(input)
		.onConflictDoUpdate({
			target: groups.id,
			set: { name: sql`excluded.name` },
		});
}
