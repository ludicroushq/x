import { X } from "@xframework/next";
import { createDrizzleModule } from "@xframework/db/drizzle";
import { createAuthJsModule } from "@xframework/auth/authjs/next";
import { db } from "../db";
import { auth } from "./auth";

export const x = X({
  modules: {
    auth: createAuthJsModule(auth),
    db: createDrizzleModule(db),
  },
});
