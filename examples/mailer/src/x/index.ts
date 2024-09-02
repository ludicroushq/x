import { X } from "@xframework/next";
import { createDrizzleModule } from "@xframework/db/drizzle";
import { createNodemailerModule } from "@xframework/mailer/nodemailer";
import { createAuthJsModule } from "@xframework/auth/authjs/next";
import { db } from "../db";
import { auth } from "./auth";
import { mailer } from "./mailer";

export const x = X({
  modules: {
    auth: createAuthJsModule(auth),
    db: createDrizzleModule(db),
    mailer: createNodemailerModule(mailer),
  },
});
