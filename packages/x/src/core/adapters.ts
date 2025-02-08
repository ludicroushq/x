import type { AsyncAdapterType, SyncAdapterType } from "./types";

// Base classes for adapter developers
export abstract class SyncAdapter<T> implements SyncAdapterType<T> {
  readonly __type = "sync" as const;
  init?(): void;
  abstract export(): T;
}

export abstract class AsyncAdapter<T> implements AsyncAdapterType<T> {
  readonly __type = "async" as const;
  init?(): Promise<void>;
  abstract export(): T;
}

export class AdapterError extends Error {
  constructor(
    message: string,
    public readonly adapterName: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AdapterError";
  }
}
