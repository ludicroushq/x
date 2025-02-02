import type { AdapterMap } from "../types/factory";

/**
 * Base factory class containing shared functionality between sync and async factories
 */
export abstract class BaseX<ContainerType> {
  constructor(
    protected readonly adapters: AdapterMap = new Map(),
    protected readonly parent?: ContainerType,
  ) {}

  protected cloneAdapters(): AdapterMap {
    return new Map(this.adapters);
  }

  protected async initializeAdapter(adapter: any, name: string): Promise<void> {
    if (adapter.init) {
      const result = adapter.init();
      if (result instanceof Promise) {
        await result;
      }
    }
  }

  protected getSnapshot(): ContainerType {
    const snapshot = this.parent ? { ...this.parent } : ({} as ContainerType);
    for (const [key, adapter] of this.adapters) {
      if (!adapter.instance) {
        adapter.instance = adapter.factory(snapshot);
      }
      (snapshot as any)[key] = adapter.instance;
    }
    return snapshot;
  }

  protected async buildFactory(): Promise<ContainerType> {
    const factory = this.parent ? { ...this.parent } : ({} as ContainerType);
    for (const [name, adapter] of this.adapters) {
      if (!adapter.instance) {
        const snapshot = this.getSnapshot();
        adapter.instance = adapter.factory(snapshot);
        await this.initializeAdapter(adapter.instance, name);
      }
      (factory as any)[name] = adapter.instance;
    }
    return factory;
  }

  protected abstract build(): any;
}
