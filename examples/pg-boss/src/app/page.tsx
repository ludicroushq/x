import { count } from "drizzle-orm";
import { pageLoads } from "../db/schema";
import { x } from "../x";

export default async function Home() {
  await x
    .get("db")
    .insert(pageLoads)
    .values([{ loadedAt: new Date() }]);
  const totalVisits = await x
    .get("db")
    .select({ count: count() })
    .from(pageLoads);
  await x.get("queue").send("sayHello", { name: "world" });
  return (
    <main>
      <h1>Hello Drizzle</h1>
      <p>
        Total visits:
        {totalVisits[0]?.count}
      </p>
    </main>
  );
}
