import { createDbModule } from ".";

export const createDrizzleModule = createDbModule(<T>(db: T) => {
  return {
    id: "drizzle",
    register: () => db,
  };
});
