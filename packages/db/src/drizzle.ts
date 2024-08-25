import { createDbModule } from './index';

export const createDrizzleModule = createDbModule(
  <T>(db: T) => ({
    id: "drizzle",
    register: () => db,
  })
);
