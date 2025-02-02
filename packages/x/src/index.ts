import type { SyncFactory } from "./types/factory";
import { SyncX } from "./core/factories";
/**
 * Creates a new synchronous factory instance
 * @param parent Optional parent container to extend from
 */
export function createX<ContainerType = {}>(
  parent?: ContainerType,
): SyncFactory<ContainerType> {
  return new SyncX<ContainerType>(new Map(), parent).build();
}
