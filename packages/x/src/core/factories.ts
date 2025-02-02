import type { AsyncAdapter, SyncAdapter } from "../adapter";
import type { AsyncFactory, SyncFactory } from "../types/factory";
import { BaseX } from "./base-x";

/**
 * Synchronous factory implementation
 */
export class SyncX<ContainerType> extends BaseX<ContainerType> {
  syncAdapter<AdapterName extends string, AdapterInstance extends SyncAdapter>(
    name: AdapterName,
    factory: (container: ContainerType) => AdapterInstance,
  ): SyncFactory<ContainerType & Record<AdapterName, AdapterInstance>> {
    const adapters = this.cloneAdapters();
    adapters.set(name, { factory });
    return new SyncX<ContainerType & Record<AdapterName, AdapterInstance>>(
      adapters,
      { ...this.getSnapshot() } as ContainerType &
        Record<AdapterName, AdapterInstance>,
    ).build();
  }

  asyncAdapter<
    AdapterName extends string,
    AdapterInstance extends AsyncAdapter,
  >(
    name: AdapterName,
    factory: (container: ContainerType) => AdapterInstance,
  ): AsyncFactory<ContainerType & Record<AdapterName, AdapterInstance>> {
    const adapters = this.cloneAdapters();
    adapters.set(name, { factory });
    return new AsyncX<ContainerType & Record<AdapterName, AdapterInstance>>(
      adapters,
      { ...this.getSnapshot() } as ContainerType &
        Record<AdapterName, AdapterInstance>,
    ).build();
  }

  use<T>(other: SyncFactory<T>): SyncFactory<ContainerType & T> {
    const combined = { ...this.getSnapshot(), ...other } as ContainerType & T;
    return new SyncX<ContainerType & T>(this.cloneAdapters(), combined).build();
  }

  build(): SyncFactory<ContainerType> {
    const factory = this.getSnapshot() as SyncFactory<ContainerType>;

    for (const [name, adapter] of this.adapters) {
      const instance = adapter.instance;
      if (instance?.init) {
        const result = instance.init();
        if (result instanceof Promise) {
          throw new Error(
            `Adapter "${name}" returned a Promise from init() in a sync factory`,
          );
        }
      }
    }

    factory.syncAdapter = this.syncAdapter.bind(this);
    factory.asyncAdapter = this.asyncAdapter.bind(this);
    factory.use = this.use.bind(this);
    return factory;
  }
}

/**
 * Asynchronous factory implementation
 */
export class AsyncX<ContainerType> extends BaseX<ContainerType> {
  syncAdapter<AdapterName extends string, AdapterInstance extends SyncAdapter>(
    name: AdapterName,
    factory: (container: ContainerType) => AdapterInstance,
  ): AsyncFactory<ContainerType & Record<AdapterName, AdapterInstance>> {
    const adapters = this.cloneAdapters();
    adapters.set(name, { factory });
    const newInstance = new AsyncX<
      ContainerType & Record<AdapterName, AdapterInstance>
    >(adapters, { ...this.getSnapshot() } as ContainerType &
      Record<AdapterName, AdapterInstance>);
    return newInstance.build();
  }

  asyncAdapter<
    AdapterName extends string,
    AdapterInstance extends AsyncAdapter,
  >(
    name: AdapterName,
    factory: (container: ContainerType) => AdapterInstance,
  ): AsyncFactory<ContainerType & Record<AdapterName, AdapterInstance>> {
    const adapters = this.cloneAdapters();
    adapters.set(name, { factory });
    const newInstance = new AsyncX<
      ContainerType & Record<AdapterName, AdapterInstance>
    >(adapters, { ...this.getSnapshot() } as ContainerType &
      Record<AdapterName, AdapterInstance>);
    return newInstance.build();
  }

  use<T>(
    other: SyncFactory<T> | AsyncFactory<T>,
  ): AsyncFactory<ContainerType & T> {
    const newPromise = (async () => {
      const otherResolved = other instanceof Promise ? await other : other;
      const combined = {
        ...this.getSnapshot(),
        ...otherResolved,
      } as ContainerType & T;
      const newInstance = new AsyncX<ContainerType & T>(
        this.cloneAdapters(),
        combined,
      );
      const result = await newInstance.build();
      return result;
    })();

    const asyncFactory = newPromise as AsyncFactory<ContainerType & T>;

    asyncFactory.syncAdapter = <AN extends string, AI extends SyncAdapter>(
      name: AN,
      factory: (container: ContainerType & T) => AI,
    ) => {
      return this.syncAdapter(name, ((container: ContainerType) => {
        return factory(container as ContainerType & T);
      }) as any) as AsyncFactory<(ContainerType & T) & Record<AN, AI>>;
    };

    asyncFactory.asyncAdapter = <AN extends string, AI extends AsyncAdapter>(
      name: AN,
      factory: (container: ContainerType & T) => AI,
    ) => {
      return this.asyncAdapter(name, ((container: ContainerType) => {
        return factory(container as ContainerType & T);
      }) as any) as AsyncFactory<(ContainerType & T) & Record<AN, AI>>;
    };

    asyncFactory.use = <NT>(other: SyncFactory<NT> | AsyncFactory<NT>) => {
      return this.use(other) as AsyncFactory<(ContainerType & T) & NT>;
    };

    return asyncFactory;
  }

  build(): AsyncFactory<ContainerType> {
    const promise = (async () => {
      return await this.buildFactory();
    })();

    const asyncFactory = promise as AsyncFactory<ContainerType>;

    asyncFactory.syncAdapter = <AN extends string, AI extends SyncAdapter>(
      name: AN,
      factory: (container: ContainerType) => AI,
    ) => {
      return this.syncAdapter(name, factory);
    };

    asyncFactory.asyncAdapter = <AN extends string, AI extends AsyncAdapter>(
      name: AN,
      factory: (container: ContainerType) => AI,
    ) => {
      return this.asyncAdapter(name, factory);
    };

    asyncFactory.use = <T>(other: SyncFactory<T> | AsyncFactory<T>) => {
      return this.use(other);
    };

    return asyncFactory;
  }
}
