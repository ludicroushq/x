import { workers } from "./x/queue";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { x } = await import("./x");

    await x.queue.registerWorkers(workers);

    await x._.worker();
  }
}
