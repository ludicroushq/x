import { x } from "./x";
import { workers } from "./x/queue";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await x.queue.registerWorkers(workers);

    await x._.worker();
  }
}
