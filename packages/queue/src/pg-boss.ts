import type PgBoss from "pg-boss";
import { QueueModule } from ".";

export class PgBossModule<
  Queues extends Record<string, object>,
> extends QueueModule {
  private boss: PgBoss;
  public workers: (() => Promise<void>)[] = [];
  private queueOptions: { [K in keyof Queues]?: PgBoss.Queue } = {};

  constructor(
    boss: PgBoss,
    {
      queueOptions,
    }: {
      queueOptions?: {
        [K in keyof Queues]?: PgBoss.Queue;
      };
    } = {},
  ) {
    super();
    this.boss = boss;
    if (queueOptions) {
      this.queueOptions = queueOptions;
    }
  }

  install() {
    const send = <Name extends keyof Queues & string>(
      name: Name,
      data: Queues[Name],
      options?: PgBoss.SendOptions,
    ) => {
      if (options) {
        return this.boss.send(name, data, options);
      }

      return this.boss.send(name, data);
    };

    const registerWorkers = async (
      workersMap: {
        [K in keyof Queues]: {
          handler: PgBoss.WorkHandler<Queues[K]>;
          workOptions?: PgBoss.WorkOptions;
        };
      },
    ) => {
      for (const name of Object.keys(workersMap)) {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const val = workersMap[name]!;
        const { handler, workOptions } = val;

        this.workers.push(async () => {
          if (workOptions) {
            await this.boss.work(name, workOptions, handler);
          } else {
            await this.boss.work(name, handler);
          }
        });
        await this.boss.createQueue(name, this.queueOptions[name]);
      }
    };

    return {
      boss: this.boss,
      send,
      registerWorkers,
    };
  }

  async initialize(): Promise<void> {
    await this.boss.start();
  }

  async worker(): Promise<void> {
    await Promise.all(this.workers.map((worker) => worker()));
  }
}

export interface Worker<K> {
  handler: PgBoss.WorkHandler<K>;
  workOptions?: PgBoss.WorkOptions;
}

export type Workers<Queues extends Record<string, object>> = {
  [K in keyof Queues]: Worker<Queues[K]>;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type WorkerQueues<T extends Record<string, Worker<any>>> = {
  [K in keyof T]: T[K] extends Worker<infer U> ? U : never;
};
