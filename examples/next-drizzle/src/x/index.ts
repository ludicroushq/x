import { XFramework } from "@xframework/core";
import { DrizzleModule } from "@xframework/db/drizzle";
import { db } from "../db";

export const x = new XFramework()
  .module("db", () => new DrizzleModule(db))
  .build();
