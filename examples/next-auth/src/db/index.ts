import Database from "better-sqlite3";
import {
  type BetterSQLite3Database,
  drizzle,
} from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

const sqlite = new Database("./sqlite.db");
export const db: BetterSQLite3Database<typeof schema> = drizzle(sqlite, {
  schema,
});

migrate(db, { migrationsFolder: "drizzle" });
