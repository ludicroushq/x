import { XConfig, XInstance, Module } from '@xframework/types';

export function X<TModules extends Record<string, Module<unknown, unknown>>>(
  config: XConfig<TModules>
): XInstance<TModules> {
  const instance = {
    modules: {} as XInstance<TModules>['modules'],
  } as XInstance<TModules>;

  Object.entries(config.modules).forEach(([name, module]) => {
    const moduleInstance = module.register();
    (instance as any)[name] = moduleInstance;
    (instance.modules as any)[name] = Object.assign({}, module);
  });

  return instance;
}

export function createModule<TInstance, TExtras, TParams extends any[]>(
  moduleCreator: (...args: TParams) => Module<TInstance, TExtras>
) {
  return moduleCreator;
}
