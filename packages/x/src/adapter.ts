/**
 * Base class for synchronous adapters
 */
export abstract class SyncAdapter<T = any> {
  readonly __type!: "sync";
  init?(): void;
  abstract export(): T;
}

/**
 * Base class for asynchronous adapters
 */
export abstract class AsyncAdapter<T = any> {
  readonly __type!: "async";
  init?(): void | Promise<void>;
  abstract export(): T;
}
