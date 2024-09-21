import type { WorkerQueues } from "@xframework/queue/pg-boss";
import { sayGoodbye } from "./worker/say-goodbye";
import { sayHello } from "./worker/say-hello";

export const workers = {
  sayHello,
  sayGoodbye,
};

export type Queues = WorkerQueues<typeof workers>;
