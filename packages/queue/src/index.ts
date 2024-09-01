import { createModule } from "@xframework/core";
import type { Module } from "@xframework/core/types";

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const createQueueModule = <TInstance, TParams extends unknown[]>(
  moduleCreator: (...args: TParams) => Module<TInstance>,
): ((...args: TParams) => Module<TInstance>) => {
  return createModule(moduleCreator);
};
