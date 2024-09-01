import { X } from "@xframework/next";
import { createDrizzleModule } from "@xframework/db/drizzle";
import { createPgBossModule } from "@xframework/queue/pg-boss";
import { db } from "../db";
import PgBoss from "pg-boss";
import { pageLoads } from "../db/schema";
import { count } from "drizzle-orm";

type Queues = {
  sayHello: { name: string };
};

const boss = new PgBoss("postgres://postgres@localhost/pgboss");

export const x = X({
  modules: {
    db: createDrizzleModule(db),
    queue: createPgBossModule<Queues>(boss),
  },
});

x.queue.registerWorkers({
  sayHello: {
    handler: async (jobs) => {
      for (const job of jobs) {
        // You can use `x`!
        const totalVisits = await x.db
          .select({ count: count() })
          .from(pageLoads);

        console.log(`Hello, ${job.data.name}!`, totalVisits);
        return totalVisits;
      }
    },
  },
});

x._.startWorker();
