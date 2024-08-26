import { createModule } from '@xframework/core';
import { Module } from '@xframework/core/types';

export function createDbModule<TInstance, TParams extends any[]>(
  moduleCreator: (...args: TParams) => Module<TInstance, {}>
) {
  return createModule(moduleCreator);
}
