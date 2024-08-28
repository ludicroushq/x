import { X } from "@xframework/next";
import { createPrismaModule } from "@xframework/db/prisma";
import { prisma } from "../db";

export const x = X({
  modules: {
    db: createPrismaModule(prisma),
  },
});
