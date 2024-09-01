import type pgBoss from "pg-boss";
import { createQueueModule } from ".";

export const createPgBossModule = createQueueModule(
  <Queues extends Record<string, object>>(
    boss: pgBoss,
    {
      queueOptions,
    }: {
      queueOptions?: {
        [K in keyof Queues]?: pgBoss.Queue;
      };
    } = {},
  ) => {
    const workers: (() => Promise<void>)[] = [];

    return {
      id: "pg-boss",
      worker: async () => {
        await Promise.all(workers.map((worker) => worker()));
      },
      initialize: async () => {
        await boss.start();
      },
      register: () => {
        const send = <Name extends keyof Queues & string>(
          name: Name,
          data: Queues[Name],
          // eslint-disable-next-line fsecond/prefer-destructured-optionals
          options?: pgBoss.SendOptions,
        ) => {
          if (options) {
            return boss.send(name, data, options);
          }

          return boss.send(name, data);
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

            workers.push(async () => {
              if (workOptions) {
                await boss.work(name, workOptions, handler);
              } else {
                await boss.work(name, handler);
              }
            });
            // eslint-disable-next-line no-void
            void boss.createQueue(name, queueOptions?.[name]);
          }
        };

        return {
          boss,
          send,
          registerWorkers,
        };
      },
    };
  },
);
