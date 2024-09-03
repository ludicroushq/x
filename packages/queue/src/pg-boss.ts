/* eslint-disable no-restricted-syntax */
/* eslint-disable unicorn/consistent-function-scoping */
import type pgBoss from "pg-boss";
import { QueueModule } from ".";

export class PgBossModule<
  Queues extends Record<string, object>,
> extends QueueModule {
  private boss: pgBoss;
  public workers: (() => Promise<void>)[] = [];
  private queueOptions: { [K in keyof Queues]?: pgBoss.Queue } = {};

  constructor(
    boss: pgBoss,
    {
      queueOptions,
    }: {
      queueOptions?: {
        [K in keyof Queues]?: pgBoss.Queue;
      };
    } = {},
  ) {
    super();
    this.boss = boss;
    if (queueOptions) {
      this.queueOptions = queueOptions;
    }
    this.worker.bind(this);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  install() {
    const send = <Name extends keyof Queues & string>(
      name: Name,
      data: Queues[Name],
      // eslint-disable-next-line fsecond/prefer-destructured-optionals
      options?: pgBoss.SendOptions,
    ) => {
      if (options) {
        return this.boss.send(name, data, options);
      }

      return this.boss.send(name, data);
    };

    const registerWorkers = (workersMap: {
      [K in keyof Queues]: {
        handler: pgBoss.WorkHandler<Queues[K]>;
        workOptions?: pgBoss.WorkOptions;
      };
    }) => {
      for (const name of Object.keys(workersMap)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const val = workersMap[name]!;
        const { handler, workOptions } = val;

        this.workers.push(async () => {
          if (workOptions) {
            await this.boss.work(name, workOptions, handler);
          } else {
            await this.boss.work(name, handler);
          }
        });
        // eslint-disable-next-line no-void
        void this.boss.createQueue(name, this.queueOptions[name]);
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
