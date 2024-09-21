import { XFramework } from "@xframework/core";
import { DrizzleModule } from "@xframework/db/drizzle";
import { PgBossModule } from "@xframework/queue/pg-boss";
import PgBoss from "pg-boss";
import { db } from "../db";
import type { Queues } from "./queue";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const boss = new PgBoss(process.env.DATABASE_URL!);

export const x = new XFramework()
  .module("db", () => new DrizzleModule(db))
  .module("queue", () => new PgBossModule<Queues>(boss))
  .build();
