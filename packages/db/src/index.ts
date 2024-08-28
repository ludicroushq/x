import { createModule } from "@xframework/core";
import type { Module } from "@xframework/core/types";

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters, @typescript-eslint/no-explicit-any
export const createDbModule = <TInstance, TParams extends any[]>(
  moduleCreator: (...args: TParams) => Module<TInstance>,
): ((...args: TParams) => Module<TInstance>) => {
  return createModule(moduleCreator);
};
