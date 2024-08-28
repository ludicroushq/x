import type { PrismaClient } from "@prisma/client/extension";
import { createDbModule } from ".";

export const createPrismaModule = createDbModule(
  <T extends PrismaClient>(prisma: T) => {
    return {
      id: "prisma",
      register: () => prisma,
    };
  },
);
