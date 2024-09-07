import { AuthJsModule } from "@xframework/auth/authjs/next";
import { X } from "@xframework/core";
import { DrizzleModule } from "@xframework/db/drizzle";
import { NextModule } from "@xframework/next";
import { db } from "../db";
import { auth } from "./auth";

export const x = new X()
  .module("db", () => new DrizzleModule(db))
  .module("auth", () => new AuthJsModule(auth))
  .module("next", () => new NextModule())
  .start();
