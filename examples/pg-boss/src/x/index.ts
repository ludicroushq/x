import { XFramework } from "@xframework/core";
import { DrizzleModule } from "@xframework/db/drizzle";
import { PgBossModule } from "@xframework/queue/pg-boss";
import { count } from "drizzle-orm";
import PgBoss from "pg-boss";
import { db } from "../db";
import { pageLoads } from "../db/schema";

type Queues = {
  sayHello: { name: string };
};

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const boss = new PgBoss(process.env.DATABASE_URL!);

export const x = new XFramework()
  .module("db", () => new DrizzleModule(db))
  .module("queue", () => new PgBossModule<Queues>(boss))
  .build();

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

x._.worker();
