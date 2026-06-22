import { pgTable, text } from "drizzle-orm/pg-core";

export const groups = pgTable("groups", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
});
