import { AsyncAdapter } from "../adapter";
import type { SyncAdapter } from "../adapter";
import type {
  AdapterMap,
  ExportedContainer,
  AdapterContainer,
  AsyncFactory,
  SyncFactory,
} from "../types/factory";

interface InitializableAdapter {
  init(): void | Promise<void>;
}

interface FactoryMethods {
  syncAdapter: Function;
  asyncAdapter: Function;
  use: Function;
}

/**
 * Base factory class containing shared functionality between sync and async factories
 */
export abstract class BaseFactory<TContainer extends AdapterContainer> {
  constructor(protected readonly adapters: AdapterMap = new Map()) {}

  protected cloneAdapters(): AdapterMap {
    return new Map(this.adapters);
  }

  protected createAdapter<TKey extends string, TAdapter>(
    name: TKey,
    factory: (container: ExportedContainer<TContainer>) => TAdapter,
  ): AdapterMap {
    const adapters = this.cloneAdapters();
    adapters.set(name, { factory: factory as any });
    return adapters;
  }

  protected bindFactoryMethods<T extends AsyncFactory<any> | SyncFactory<any>>(
    factory: T,
    instance: FactoryMethods,
  ): void {
    factory.syncAdapter = instance.syncAdapter.bind(instance);
    factory.asyncAdapter = instance.asyncAdapter.bind(instance);
    factory.use = instance.use.bind(instance);
  }

  protected mergeAdapters<T extends AdapterContainer>(
    other: ExportedContainer<T>,
  ): AdapterMap {
    const newAdapters = this.cloneAdapters();
    for (const [key, adapter] of Object.entries(other._.adapters)) {
      newAdapters.set(key, {
        factory: () => adapter,
        instance: adapter,
        initialized: true,
      });
    }
    return newAdapters;
  }

  protected async initAdapter(adapter: unknown, name: string): Promise<void> {
    if (this.isInitializable(adapter)) {
      const result = adapter.init();
      if (result instanceof Promise) {
        await result;
      }
    }
  }

  private isInitializable(adapter: unknown): adapter is InitializableAdapter {
    return (
      adapter !== null &&
      typeof adapter === "object" &&
      "init" in adapter &&
      typeof (adapter as InitializableAdapter).init === "function"
    );
  }

  protected createSnapshot(): ExportedContainer<TContainer> {
    const snapshot = {} as TContainer;
    const rawAdapters = {} as TContainer;
    const result = snapshot as ExportedContainer<TContainer>;
    result._ = { adapters: rawAdapters };

    for (const [key, adapter] of this.adapters) {
      if (!adapter.instance) {
        adapter.instance = adapter.factory(result);
      }

      const instance = adapter.instance as SyncAdapter<any> | AsyncAdapter<any>;
      if (instance && typeof instance === "object" && "export" in instance) {
        try {
          (result as any)[key] = instance.export();
          (result._.adapters as any)[key] = instance;
        } catch (error: any) {
          throw new Error(
            `Failed to export adapter "${key}": ${error?.message || error}`,
          );
        }
      } else if (instance) {
        (result as any)[key] = instance;
        (result._.adapters as any)[key] = instance;
      }
    }

    return result;
  }

  protected async createFactory(): Promise<ExportedContainer<TContainer>> {
    const factory = {} as TContainer;
    const rawAdapters = {} as TContainer;
    const result = factory as ExportedContainer<TContainer>;
    result._ = { adapters: rawAdapters };

    const initializedAdapters = new Set<string>();

    // First, create all instances
    for (const [name, adapter] of this.adapters) {
      if (!adapter.instance) {
        try {
          adapter.instance = adapter.factory(result);
        } catch (error: any) {
          throw new Error(
            `Failed to create adapter "${name}": ${error?.message || error}`,
          );
        }
      }

      const instance = adapter.instance as SyncAdapter<any> | AsyncAdapter<any>;
      if (instance && typeof instance === "object" && "export" in instance) {
        try {
          (result as any)[name] = instance.export();
          (result._.adapters as any)[name] = instance;
        } catch (error: any) {
          throw new Error(
            `Failed to export adapter "${name}": ${error?.message || error}`,
          );
        }
      } else {
        (result as any)[name] = instance;
        (result._.adapters as any)[name] = instance;
      }
    }

    // Initialize all adapters in order
    for (const [name, adapter] of this.adapters) {
      if (initializedAdapters.has(name) || adapter.initialized) continue;

      const instance = adapter.instance;
      if (
        instance &&
        typeof instance === "object" &&
        "init" in instance &&
        typeof instance.init === "function"
      ) {
        try {
          const initResult = instance.init();
          if (initResult instanceof Promise) {
            if (!(instance instanceof AsyncAdapter)) {
              throw new Error(
                `Adapter "${name}" returned a Promise from init() in a sync factory`,
              );
            }
            await initResult;
          }
          initializedAdapters.add(name);
          adapter.initialized = true;
        } catch (error: any) {
          throw new Error(
            `Failed to initialize adapter "${name}": ${error?.message || error}`,
          );
        }
      }
    }

    return result;
  }
}
