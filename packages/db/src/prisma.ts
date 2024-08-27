import { createDbModule } from './index';
import type {PrismaClient} from "@prisma/client"

export const createPrismaModule = createDbModule((prisma: PrismaClient) => ({
    id: "prisma",
    register: () => prisma,
  })
);
