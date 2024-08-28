import type { PrismaClient } from "@prisma/client";
import { createDbModule } from ".";

export const createPrismaModule = createDbModule((prisma: PrismaClient) => {
  return {
    id: "prisma",
    register: () => prisma,
  };
});
