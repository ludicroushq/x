import type { SyncFactory, AdapterContainer } from "./types/factory";
import { SyncX } from "./core/factories";

/**
 * Creates a new synchronous factory instance.
 * Use .use() to compose with other factories.
 */
export function createX<
  TContainer extends AdapterContainer = {},
>(): SyncFactory<TContainer> {
  return new SyncX<TContainer>(new Map()).build();
}
