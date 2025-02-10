// Core adapter type definitions
export type SyncAdapterType<TExport = unknown> = {
  __type: "sync";
  init?(): void;
  export(): TExport;
};

export type AsyncAdapterType<TExport = unknown> = {
  __type: "async";
  init?(): Promise<void>;
  export(): TExport;
};

export type AnyAdapter = SyncAdapterType | AsyncAdapterType;
export type AdapterRegistry = Record<string, AnyAdapter>;

// Helper type to extract the exported type from an adapter
export type ExportType<TAdapter> = TAdapter extends
  | SyncAdapterType<infer TExport>
  | AsyncAdapterType<infer TExport>
  ? TExport
  : never;

// Result type with metadata container
export type AdapterResult<TAdapters extends AdapterRegistry> = {
  [Key in keyof TAdapters]: ExportType<TAdapters[Key]>;
} & {
  _: {
    adapters: TAdapters;
  };
};

export type BuildOutput<
  TAdapters extends AdapterRegistry,
  TIsAsync extends boolean,
> = TIsAsync extends true
  ? Promise<AdapterResult<TAdapters>>
  : AdapterResult<TAdapters>;

// Factory types
export type SyncAdapterCreator<TExport, TDeps extends AdapterRegistry> = (
  dependencies: AdapterResult<TDeps>,
) => SyncAdapterType<TExport>;

export type AsyncAdapterCreator<TExport, TDeps extends AdapterRegistry> = (
  dependencies: AdapterResult<TDeps>,
) => Promise<AsyncAdapterType<TExport>> | AsyncAdapterType<TExport>;
