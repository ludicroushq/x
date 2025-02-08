import { AdapterError } from "./adapters";
import type {
  AdapterContainer,
  SyncAdapterType,
  SyncAdapterConfig,
  AsyncAdapterType,
  Result,
  AsyncAdapterConfig,
  BuildResult,
  AdapterType,
} from "./types";

export class X<
  TContainer extends AdapterContainer = {},
  IsAsync extends boolean = false,
> {
  constructor(
    private readonly adapters: Record<string, [(x: any) => any, boolean]> = {},
    private readonly isAsync: IsAsync = false as IsAsync,
  ) {}

  syncAdapter<K extends string, T, C = void>(
    config: SyncAdapterConfig<K, T, C, TContainer>,
  ): X<TContainer & Record<K, SyncAdapterType<T>>, IsAsync> {
    const newAdapters = { ...this.adapters };
    newAdapters[config.name] = [
      (deps: Result<TContainer>) => {
        return config.config
          ? // eslint-disable-next-line new-cap
            new config.adapter(config.config(deps))
          : // eslint-disable-next-line new-cap
            new config.adapter();
      },
      false,
    ];
    return new X(newAdapters, this.isAsync);
  }

  asyncAdapter<K extends string, T, C = void>(
    config: AsyncAdapterConfig<K, T, C, TContainer>,
  ): X<TContainer & Record<K, AsyncAdapterType<T>>, true> {
    const newAdapters = { ...this.adapters };
    newAdapters[config.name] = [
      async (deps: Result<TContainer>) => {
        return config.config
          ? // eslint-disable-next-line new-cap
            new config.adapter(config.config(deps))
          : // eslint-disable-next-line new-cap
            new config.adapter();
      },
      true,
    ];
    return new X(newAdapters, true);
  }

  use<T extends AdapterContainer, B extends boolean>(
    other: X<T, B>,
  ): X<TContainer & T, IsAsync | B> {
    const newAdapters = { ...this.adapters, ...other["adapters"] };
    return new X(newAdapters, this.isAsync || other["isAsync"]);
  }

  build(): BuildResult<TContainer, IsAsync> {
    if (this.isAsync) {
      return this.buildAsync() as BuildResult<TContainer, IsAsync>;
    }
    return this.buildSync() as BuildResult<TContainer, IsAsync>;
  }

  private buildSync(): Result<TContainer> {
    const result = {
      _: { adapters: {} as TContainer },
    } as Result<TContainer>;

    try {
      for (const [key, [factory, isAsync]] of Object.entries(this.adapters)) {
        if (isAsync) {
          throw new AdapterError(
            `Cannot use async adapter "${key}" in sync build`,
            key,
          );
        }

        try {
          const adapter = factory(result);

          if (adapter.__type === "async") {
            throw new AdapterError(
              `Factory returned async adapter "${key}" in sync build`,
              key,
            );
          }

          (result._.adapters as any)[key] = adapter;
          if (adapter.init) {
            adapter.init();
          }
          (result as any)[key] = adapter.export();
        } catch (error) {
          throw new AdapterError(
            `Failed to initialize adapter "${key}"`,
            key,
            error,
          );
        }
      }

      return result;
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }
      throw new AdapterError("Failed to build adapters", "", error);
    }
  }

  private async buildAsync(): Promise<Result<TContainer>> {
    const result = {
      _: { adapters: {} as TContainer },
    } as Result<TContainer>;

    try {
      for (const [key, [factory, isAsync]] of Object.entries(this.adapters)) {
        try {
          let adapter: AdapterType;
          const currentResult = { ...result };

          if (isAsync) {
            adapter = await factory(currentResult);
          } else {
            adapter = factory(currentResult);
          }

          (result._.adapters as any)[key] = adapter;

          if (adapter.init) {
            if (adapter.__type === "async") {
              await adapter.init();
            } else {
              adapter.init();
            }
          }

          (result as any)[key] = adapter.export();
        } catch (error) {
          throw new AdapterError(
            `Failed to initialize adapter "${key}"`,
            key,
            error,
          );
        }
      }

      return result;
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }
      throw new AdapterError("Failed to build adapters", "", error);
    }
  }
}
