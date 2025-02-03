import type { AsyncAdapter, SyncAdapter } from "../adapter";
import type {
  AsyncFactory,
  SyncFactory,
  ExportedContainer,
  AdapterContainer,
} from "../types/factory";
import { BaseFactory } from "./base-factory";

/**
 * Synchronous factory implementation
 */
export class SyncX<
  TContainer extends AdapterContainer,
> extends BaseFactory<TContainer> {
  syncAdapter<TKey extends string, TAdapter extends SyncAdapter<T>, T = any>(
    name: TKey,
    factory: (container: ExportedContainer<TContainer>) => TAdapter,
  ): SyncFactory<TContainer & Record<TKey, TAdapter>> {
    const newInstance = new SyncX<TContainer & Record<TKey, TAdapter>>(
      this.createAdapter(name, factory),
    );
    return newInstance.build();
  }

  asyncAdapter<TKey extends string, TAdapter extends AsyncAdapter<T>, T = any>(
    name: TKey,
    factory: (container: ExportedContainer<TContainer>) => TAdapter,
  ): AsyncFactory<TContainer & Record<TKey, TAdapter>> {
    const newInstance = new AsyncX<TContainer & Record<TKey, TAdapter>>(
      this.createAdapter(name, factory),
    );
    return newInstance.build();
  }

  use<T extends AdapterContainer>(
    other: SyncFactory<T>,
  ): SyncFactory<TContainer & T>;
  use<T extends AdapterContainer>(
    other: AsyncFactory<T>,
  ): AsyncFactory<TContainer & T>;
  use<T extends AdapterContainer>(
    other: SyncFactory<T> | AsyncFactory<T>,
  ): SyncFactory<TContainer & T> | AsyncFactory<TContainer & T> {
    if (other instanceof Promise) {
      const asyncResult = (async () => {
        const otherResolved = await other;
        const newInstance = new AsyncX<TContainer & T>(
          this.mergeAdapters(otherResolved),
        );
        return await newInstance.build();
      })();

      const asyncFactory = asyncResult as AsyncFactory<TContainer & T>;
      this.bindFactoryMethods(
        asyncFactory,
        new AsyncX<TContainer & T>(this.cloneAdapters()),
      );
      return asyncFactory;
    }

    // Handle sync factory case
    const newInstance = new SyncX<TContainer & T>(this.mergeAdapters(other));
    return newInstance.build();
  }

  build(): SyncFactory<TContainer> {
    const factory = this.createSnapshot() as any as SyncFactory<TContainer>;
    const initializedAdapters = new Set<string>();

    // Initialize sync adapters in order
    for (const [name, adapter] of this.adapters) {
      if (initializedAdapters.has(name) || adapter.initialized) continue;

      const instance = adapter.instance;
      if (
        instance &&
        typeof instance === "object" &&
        "init" in instance &&
        typeof instance.init === "function"
      ) {
        const result = instance.init();
        if (result instanceof Promise) {
          throw new Error(
            `Adapter "${name}" returned a Promise from init() in a sync factory`,
          );
        }
        initializedAdapters.add(name);
        adapter.initialized = true;
      }
    }

    this.bindFactoryMethods(factory, this);
    return factory;
  }
}

/**
 * Asynchronous factory implementation
 */
export class AsyncX<
  TContainer extends AdapterContainer,
> extends BaseFactory<TContainer> {
  syncAdapter<TKey extends string, TAdapter extends SyncAdapter<T>, T = any>(
    name: TKey,
    factory: (container: ExportedContainer<TContainer>) => TAdapter,
  ): AsyncFactory<TContainer & Record<TKey, TAdapter>> {
    const newInstance = new AsyncX<TContainer & Record<TKey, TAdapter>>(
      this.createAdapter(name, factory),
    );
    return newInstance.build();
  }

  asyncAdapter<TKey extends string, TAdapter extends AsyncAdapter<T>, T = any>(
    name: TKey,
    factory: (container: ExportedContainer<TContainer>) => TAdapter,
  ): AsyncFactory<TContainer & Record<TKey, TAdapter>> {
    const newInstance = new AsyncX<TContainer & Record<TKey, TAdapter>>(
      this.createAdapter(name, factory),
    );
    return newInstance.build();
  }

  use<T extends AdapterContainer>(
    other: SyncFactory<T> | AsyncFactory<T>,
  ): AsyncFactory<TContainer & T> {
    const newPromise = (async () => {
      const otherResolved = other instanceof Promise ? await other : other;
      const newInstance = new AsyncX<TContainer & T>(
        this.mergeAdapters(otherResolved),
      );
      return await newInstance.build();
    })();

    const asyncFactory = newPromise as AsyncFactory<TContainer & T>;
    this.bindFactoryMethods(
      asyncFactory,
      new AsyncX<TContainer & T>(this.cloneAdapters()),
    );
    return asyncFactory;
  }

  build(): AsyncFactory<TContainer> {
    const promise = (async () => {
      return await this.createFactory();
    })();

    const asyncFactory = promise as AsyncFactory<TContainer>;
    this.bindFactoryMethods(asyncFactory, this);
    return asyncFactory;
  }
}
