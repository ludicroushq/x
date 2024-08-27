import type { PrismaClient } from '@prisma/client'
import { createDbModule } from './index'

export const createPrismaModule = createDbModule((prisma: PrismaClient) => ({
  id: 'prisma',
  register: () => prisma,
}),
)
