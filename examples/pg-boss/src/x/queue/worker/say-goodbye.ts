import type { Worker } from "@xframework/queue/pg-boss";

export const sayGoodbye: Worker<{
  name: string;
  phrase: "Goodbye" | "Farewell";
}> = {
  async handler([job]) {
    if (!job) return;
    console.log(`${job.data.phrase}, ${job.data.name}!`);
  },
};
