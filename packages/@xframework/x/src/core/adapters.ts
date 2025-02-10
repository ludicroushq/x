import type { SyncAdapterType, AsyncAdapterType } from "./types";

export abstract class SyncAdapter<TExport> implements SyncAdapterType<TExport> {
  readonly __type = "sync" as const;
  init?(): void;
  abstract export(): TExport;
}

export abstract class AsyncAdapter<TExport>
  implements AsyncAdapterType<TExport>
{
  readonly __type = "async" as const;
  init?(): Promise<void>;
  abstract export(): TExport;
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
