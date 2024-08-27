import { createModule } from '@xframework/core'
import type { Module } from '@xframework/core/types'

export function createDbModule<TInstance, TParams extends any[]>(
  // eslint-disable-next-line ts/no-empty-object-type
  moduleCreator: (...args: TParams) => Module<TInstance, {}>,
) {
  return createModule(moduleCreator)
}
