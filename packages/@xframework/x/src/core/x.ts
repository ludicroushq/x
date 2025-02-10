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

type AdapterFactory<T extends AdapterRegistry> =
  | [(deps: AdapterResult<T>) => SyncAdapterType<unknown>, false]
  | [(deps: AdapterResult<T>) => Promise<AsyncAdapterType<unknown>>, true];

class X<
  TAdapters extends AdapterRegistry = Record<string, never>,
  TIsAsync extends boolean = false,
> {
  constructor(
    private readonly adapterFactories: Record<
      string,
      AdapterFactory<TAdapters>
    > = {} as Record<string, AdapterFactory<TAdapters>>,
    private readonly isAsync: TIsAsync = false as TIsAsync,
  ) {}

  syncAdapter<TKey extends string, TExport>(
    name: TKey,
    factory: SyncAdapterCreator<TExport, TAdapters>,
  ): X<TAdapters & Record<TKey, SyncAdapterType<TExport>>, TIsAsync> {
    type NewAdapters = TAdapters & Record<TKey, SyncAdapterType<TExport>>;
    const newFactories = { ...this.adapterFactories };
    // We know this is safe because factory is a SyncAdapterCreator
    (newFactories as Record<string, unknown>)[name] = [
      factory,
      false,
    ] as AdapterFactory<NewAdapters>;
    return new X(
      newFactories as Record<string, AdapterFactory<NewAdapters>>,
      this.isAsync,
    );
  }

  asyncAdapter<TKey extends string, TExport>(
    name: TKey,
    factory: AsyncAdapterCreator<TExport, TAdapters>,
  ): X<TAdapters & Record<TKey, AsyncAdapterType<TExport>>, true> {
    type NewAdapters = TAdapters & Record<TKey, AsyncAdapterType<TExport>>;
    const wrappedFactory = async (deps: AdapterResult<TAdapters>) => {
      const result = factory(deps);
      return result instanceof Promise ? await result : result;
    };

    const newFactories = { ...this.adapterFactories };
    // We know this is safe because wrappedFactory returns a Promise<AsyncAdapterType>
    (newFactories as Record<string, unknown>)[name] = [
      wrappedFactory,
      true,
    ] as AdapterFactory<NewAdapters>;
    return new X(
      newFactories as Record<string, AdapterFactory<NewAdapters>>,
      true,
    );
  }

  use<TOtherAdapters extends AdapterRegistry, TOtherAsync extends boolean>(
    other: X<TOtherAdapters, TOtherAsync>,
  ): X<TAdapters & TOtherAdapters, TIsAsync | TOtherAsync> {
    type CombinedAdapters = TAdapters & TOtherAdapters;
    const newFactories = {
      ...this.adapterFactories,
      ...other["adapterFactories"],
    } as Record<string, AdapterFactory<CombinedAdapters>>;
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

    for (const [key, [factory, isAsync]] of Object.entries(
      this.adapterFactories,
    )) {
      if (isAsync) {
        throw new AdapterError(
          `Cannot use async adapter "${key}" in sync build`,
          key,
        );
      }

      const adapter = factory(result) as SyncAdapterType<unknown>;

      if (adapter.__type !== "sync") {
        throw new AdapterError(
          `Factory returned async adapter "${key}" in sync build`,
          key,
        );
      }

      (result._.adapters as Record<string, SyncAdapterType<unknown>>)[key] =
        adapter;
      adapter.init?.();
      (result as Record<string, unknown>)[key] = adapter.export();
    }

    return result;
  }

  private async buildAsync(): Promise<AdapterResult<TAdapters>> {
    const result = {
      _: { adapters: {} as TAdapters },
    } as AdapterResult<TAdapters>;

    for (const [key, [factory, isAsync]] of Object.entries(
      this.adapterFactories,
    )) {
      const currentResult = { ...result };
      const adapter = isAsync
        ? await (
            factory as (
              deps: AdapterResult<TAdapters>,
            ) => Promise<AsyncAdapterType<unknown>>
          )(currentResult)
        : (
            factory as (
              deps: AdapterResult<TAdapters>,
            ) => SyncAdapterType<unknown>
          )(currentResult);

      (
        result._.adapters as Record<
          string,
          SyncAdapterType<unknown> | AsyncAdapterType<unknown>
        >
      )[key] = adapter;

      if (adapter.init) {
        if (adapter.__type === "async") {
          await adapter.init();
        } else {
          adapter.init();
        }
      }

      (result as Record<string, unknown>)[key] =
        adapter.__type === "async" ? await adapter.export() : adapter.export();
    }

    return result;
  }
}

export function createX() {
  return new X();
}
