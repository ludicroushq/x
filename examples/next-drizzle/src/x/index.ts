import { X } from "@xframework/core";
import { DrizzleModule } from "@xframework/db/drizzle";
import { db } from "../db";

export const x = new X().module("db", () => new DrizzleModule(db)).start();
