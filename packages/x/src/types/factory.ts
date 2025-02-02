import type { AsyncAdapter, SyncAdapter } from "../adapter";
import type { AdapterType } from "./adapter";

/**
 * Type guard to ensure correct adapter types
 */
export type IsAdapterType<
  AdapterInstance,
  Type extends AdapterType,
> = AdapterInstance extends {
  __type: Type;
}
  ? true
  : false;

/**
 * Ensures the adapter matches the expected type
 */
export type EnsureAdapterType<AdapterInstance, Type extends AdapterType> =
  IsAdapterType<AdapterInstance, Type> extends true
    ? AdapterInstance
    : `Error: Expected ${Capitalize<Type>}Adapter`;

/**
 * Type definition for synchronous factory
 */
export type SyncFactory<ContainerType> = ContainerType & {
  syncAdapter<AdapterName extends string, AdapterInstance extends SyncAdapter>(
    name: AdapterName,
    factory: (container: ContainerType) => AdapterInstance,
  ): SyncFactory<ContainerType & Record<AdapterName, AdapterInstance>>;

  asyncAdapter<
    AdapterName extends string,
    AdapterInstance extends AsyncAdapter,
  >(
    name: AdapterName,
    factory: (container: ContainerType) => AdapterInstance,
  ): AsyncFactory<ContainerType & Record<AdapterName, AdapterInstance>>;

  use<T>(other: SyncFactory<T>): SyncFactory<ContainerType & T>;
};

/**
 * Type definition for asynchronous factory
 */
export type AsyncFactory<ContainerType> = Promise<ContainerType> & {
  syncAdapter<AdapterName extends string, AdapterInstance extends SyncAdapter>(
    name: AdapterName,
    factory: (container: ContainerType) => AdapterInstance,
  ): AsyncFactory<ContainerType & Record<AdapterName, AdapterInstance>>;

  asyncAdapter<
    AdapterName extends string,
    AdapterInstance extends AsyncAdapter,
  >(
    name: AdapterName,
    factory: (container: ContainerType) => AdapterInstance,
  ): AsyncFactory<ContainerType & Record<AdapterName, AdapterInstance>>;

  use<T>(
    other: SyncFactory<T> | AsyncFactory<T>,
  ): AsyncFactory<ContainerType & T>;
};

/**
 * Type definition for adapter storage map
 */
export type AdapterMap = Map<
  string,
  {
    factory: (container: any) => any;
    instance?: any;
  }
>;
