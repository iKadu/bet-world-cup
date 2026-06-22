import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { groups } from "./groups";

export const teams = pgTable("teams", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	shortName: text("short_name"),
	tla: text("tla"),
	crestUrl: text("crest_url"),
	groupId: text("group_id").references(() => groups.id),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
});

export const teamsRelations = relations(teams, ({ one }) => ({
	group: one(groups, {
		fields: [teams.groupId],
		references: [groups.id],
	}),
}));
