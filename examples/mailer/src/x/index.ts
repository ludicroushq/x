import { X } from "@xframework/core";
import { db } from "../db";
import { auth } from "./auth";
import { mailer } from "./mailer";
import { AuthJsModule } from "@xframework/auth/authjs/next";
import { DrizzleModule } from "@xframework/db/drizzle";
import { NodemailerModule } from "@xframework/mailer/nodemailer";
import { NextModule } from "@xframework/next";

export const x = new X()
  .module("auth", () => new AuthJsModule(auth))
  .module("db", () => new DrizzleModule(db))
  .module("mailer", () => new NodemailerModule(mailer))
  .module("next", () => new NextModule());
