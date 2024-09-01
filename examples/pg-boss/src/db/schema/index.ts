import { timestamp, pgTable, text } from "drizzle-orm/pg-core";

export const pageLoads = pgTable("page_loads", {
  id: text("id"),
  loadedAt: timestamp("loaded_at"),
});
