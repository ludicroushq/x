import { AdapterError } from "./adapters";
import type {
  SyncAdapterCreator,
  SyncAdapterType,
  AsyncAdapterCreator,
  AsyncAdapterType,
  AdapterRegistry,
  AdapterResult,
  BuildOutput,
} from "./types";

class X<
  TAdapters extends AdapterRegistry = {},
  TIsAsync extends boolean = false,
> {
  constructor(
    private readonly adapterFactories: Record<
      string,
      [(deps: any) => any, boolean]
    > = {},
    private readonly isAsync: TIsAsync = false as TIsAsync,
  ) {}

  syncAdapter<TKey extends string, TExport>(
    name: TKey,
    factory: SyncAdapterCreator<TExport, TAdapters>,
  ): X<TAdapters & Record<TKey, SyncAdapterType<TExport>>, TIsAsync> {
    const newFactories = { ...this.adapterFactories };
    newFactories[name] = [factory, false];
    return new X(newFactories, this.isAsync);
  }

  asyncAdapter<TKey extends string, TExport>(
    name: TKey,
    factory: AsyncAdapterCreator<TExport, TAdapters>,
  ): X<TAdapters & Record<TKey, AsyncAdapterType<TExport>>, true> {
    const wrappedFactory = async (deps: AdapterResult<TAdapters>) => {
      const result = factory(deps);
      return result instanceof Promise ? await result : result;
    };

    const newFactories = { ...this.adapterFactories };
    newFactories[name] = [wrappedFactory, true];
    return new X(newFactories, true);
  }

  use<TOtherAdapters extends AdapterRegistry, TOtherAsync extends boolean>(
    other: X<TOtherAdapters, TOtherAsync>,
  ): X<TAdapters & TOtherAdapters, TIsAsync | TOtherAsync> {
    const newFactories = {
      ...this.adapterFactories,
      ...other["adapterFactories"],
    };
    return new X(newFactories, this.isAsync || other["isAsync"]);
  }

  build(): BuildOutput<TAdapters, TIsAsync> {
    return this.isAsync
      ? (this.buildAsync() as BuildOutput<TAdapters, TIsAsync>)
      : (this.buildSync() as BuildOutput<TAdapters, TIsAsync>);
  }

  private buildSync(): AdapterResult<TAdapters> {
    const result = {
      _: { adapters: {} as TAdapters },
    } as AdapterResult<TAdapters>;

    try {
      for (const [key, [factory, isAsync]] of Object.entries(
        this.adapterFactories,
      )) {
        if (isAsync) {
          throw new AdapterError(
            `Cannot use async adapter "${key}" in sync build`,
            key,
          );
        }

        try {
          const adapter = (factory as SyncAdapterCreator<any, TAdapters>)(
            result,
          );

          // @ts-expect-error this should never happen with typescript
          if (adapter.__type === "async") {
            throw new AdapterError(
              `Factory returned async adapter "${key}" in sync build`,
              key,
            );
          }

          (result._.adapters as any)[key] = adapter;
          adapter.init?.();
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

  private async buildAsync(): Promise<AdapterResult<TAdapters>> {
    const result = {
      _: { adapters: {} as TAdapters },
    } as AdapterResult<TAdapters>;

    try {
      for (const [key, [factory, isAsync]] of Object.entries(
        this.adapterFactories,
      )) {
        try {
          const currentResult = { ...result };
          const adapter = isAsync
            ? await (factory as AsyncAdapterCreator<any, TAdapters>)(
                currentResult,
              )
            : (factory as SyncAdapterCreator<any, TAdapters>)(currentResult);

          (result._.adapters as any)[key] = adapter;

          if (adapter.init) {
            adapter.__type === "async" ? await adapter.init() : adapter.init();
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

export function createX() {
  return new X();
}
