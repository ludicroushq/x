import type { AsyncAdapter, SyncAdapter } from "../adapter";
import type { AdapterType } from "./adapter";

/**
 * Base type for adapter containers
 */
export type AdapterContainer = {
  [key: string]: SyncAdapter<any> | AsyncAdapter<any>;
};

/**
 * Type guard to ensure correct adapter types
 */
export type IsAdapterOfType<
  TAdapter,
  TType extends AdapterType,
> = TAdapter extends {
  __type: TType;
}
  ? true
  : false;

/**
 * Ensures the adapter matches the expected type
 */
export type ValidateAdapterType<TAdapter, TType extends AdapterType> =
  IsAdapterOfType<TAdapter, TType> extends true
    ? TAdapter
    : `Error: Expected ${Capitalize<TType>}Adapter`;

/**
 * Type definition for adapter storage map
 */
export interface AdapterMapEntry {
  factory: (container: any) => any;
  instance?: unknown;
  initialized?: boolean;
}

export type AdapterMap = Map<string, AdapterMapEntry>;

/**
 * Extracts the exported type from an adapter
 */
type ExtractExportType<T> = T extends
  | SyncAdapter<infer E>
  | AsyncAdapter<infer E>
  ? E
  : T;

/**
 * Maps container types to their exported types
 */
export type ExportedContainer<TContainer> = {
  [K in keyof TContainer]: ExtractExportType<TContainer[K]>;
} & {
  _: {
    adapters: TContainer;
  };
};

/**
 * Type definition for synchronous factory
 */
export type SyncFactory<TContainer extends AdapterContainer> =
  ExportedContainer<TContainer> & {
    syncAdapter<TKey extends string, TAdapter extends SyncAdapter<T>, T = any>(
      name: TKey,
      factory: (container: ExportedContainer<TContainer>) => TAdapter,
    ): SyncFactory<TContainer & Record<TKey, TAdapter>>;

    asyncAdapter<
      TKey extends string,
      TAdapter extends AsyncAdapter<T>,
      T = any,
    >(
      name: TKey,
      factory: (container: ExportedContainer<TContainer>) => TAdapter,
    ): AsyncFactory<TContainer & Record<TKey, TAdapter>>;

    use<T extends AdapterContainer>(
      other: SyncFactory<T>,
    ): SyncFactory<TContainer & T>;
    use<T extends AdapterContainer>(
      other: AsyncFactory<T>,
    ): AsyncFactory<TContainer & T>;
  };

/**
 * Type definition for asynchronous factory
 */
export type AsyncFactory<TContainer extends AdapterContainer> = Promise<
  ExportedContainer<TContainer>
> & {
  syncAdapter<TKey extends string, TAdapter extends SyncAdapter<T>, T = any>(
    name: TKey,
    factory: (container: ExportedContainer<TContainer>) => TAdapter,
  ): AsyncFactory<TContainer & Record<TKey, TAdapter>>;

  asyncAdapter<TKey extends string, TAdapter extends AsyncAdapter<T>, T = any>(
    name: TKey,
    factory: (container: ExportedContainer<TContainer>) => TAdapter,
  ): AsyncFactory<TContainer & Record<TKey, TAdapter>>;

  use<T extends AdapterContainer>(
    other: SyncFactory<T> | AsyncFactory<T>,
  ): AsyncFactory<TContainer & T>;
};
