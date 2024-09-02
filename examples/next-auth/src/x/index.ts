import { X } from "@xframework/core";
import { db } from "../db";
import { auth } from "./auth";
import { DrizzleModule } from "@xframework/db/drizzle";
import { AuthJsModule } from "@xframework/auth/authjs/next";
import { NextModule } from "@xframework/next";

export const x = new X()
  .module("db", () => new DrizzleModule(db))
  .module("auth", () => new AuthJsModule(auth))
  .module("next", () => new NextModule());
