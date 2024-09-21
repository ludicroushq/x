import type { Worker } from "@xframework/queue/pg-boss";

export const sayHello: Worker<{
  name: string;
}> = {
  async handler([job]) {
    if (!job) return;
    console.log(`Hello, ${job.data.name}!`);
  },
};
