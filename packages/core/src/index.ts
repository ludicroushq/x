import { XConfig, XInstance, Module } from './types';
import { Hono } from 'hono';

export function X<TModules extends Record<string, Module<unknown, unknown>>>(
  config: XConfig<TModules>
): XInstance<TModules> {
  const hono = new Hono().basePath('/x');

  const instance = {
    _: {
      modules: {} as XInstance<TModules>['modules'],
      hono,
    }
  } as XInstance<TModules>;


  Object.entries(config.modules).forEach(([name, module]) => {
    const moduleInstance = module.register();
    (instance as any)[name] = moduleInstance;
    (instance.modules as any)[name] = Object.assign({}, module);

    if (module.hono) {
      hono.route('/', module.hono);
    }
  });

  return instance;
}

export function createModule<TInstance, TExtras, TParams extends any[]>(
  moduleCreator: (...args: TParams) => Module<TInstance, TExtras>
) {
  return moduleCreator;
}
