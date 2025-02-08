// Base types for sync and async adapters
export type SyncAdapterType<T = any> = {
  __type: "sync";
  init?(): void;
  export(): T;
};

export type AsyncAdapterType<T = any> = {
  __type: "async";
  init?(): Promise<void>;
  export(): T;
};

export type AdapterType = SyncAdapterType | AsyncAdapterType;
export type AdapterContainer = Record<string, AdapterType>;

// Helper type to extract the exported type from an adapter
export type ExtractExport<T> = T extends
  | SyncAdapterType<infer E>
  | AsyncAdapterType<infer E>
  ? E
  : never;

// Result type with _ container
export type Result<T extends AdapterContainer> = {
  [K in keyof T]: ExtractExport<T[K]>;
} & {
  _: {
    adapters: T;
  };
};

export type BuildResult<
  T extends AdapterContainer,
  IsAsync extends boolean,
> = IsAsync extends true ? Promise<Result<T>> : Result<T>;

// New types for adapter configuration
export type NoConfigConstructor<T> = new () =>
  | SyncAdapterType<T>
  | AsyncAdapterType<T>;
export type ConfigConstructor<T, C> = new (
  config: C,
) => SyncAdapterType<T> | AsyncAdapterType<T>;

export type AdapterClass<T, C = void> = C extends void
  ? NoConfigConstructor<T>
  : ConfigConstructor<T, C>;

export type SyncAdapterConfig<
  K extends string,
  T,
  C = void,
  D extends AdapterContainer = {},
> = C extends void
  ? { name: K; adapter: NoConfigConstructor<T>; config?: never }
  : {
      name: K;
      adapter: ConfigConstructor<T, C>;
      config: (dependencies: Result<D>) => C;
    };

export type AsyncAdapterConfig<
  K extends string,
  T,
  C = void,
  D extends AdapterContainer = {},
> = C extends void
  ? { name: K; adapter: NoConfigConstructor<T>; config?: never }
  : {
      name: K;
      adapter: ConfigConstructor<T, C>;
      config: (dependencies: Result<D>) => C;
    };
