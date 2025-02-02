/**
 * Base class for synchronous adapters
 */
export abstract class SyncAdapter {
  readonly __type!: "sync";
  init?(): void;
}

/**
 * Base class for asynchronous adapters
 */
export abstract class AsyncAdapter {
  readonly __type!: "async";
  init?(): void | Promise<void>;
}
