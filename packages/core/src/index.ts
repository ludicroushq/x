import { Hono } from "hono";
import type { Module, XConfig, XInstance } from "./types";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const X = <TModules extends Record<string, Module<unknown, unknown>>>(
  config: XConfig<TModules>,
): XInstance<TModules> => {
  const hono = new Hono().basePath("/x");

  const instance = {
    _: {
      modules: {} as XInstance<TModules>["modules"],
      hono,
    },
  } as XInstance<TModules>;

  Object.entries(config.modules).forEach(([name, module]) => {
    const moduleInstance = module.register();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (instance as any)[name] = moduleInstance;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (instance._.modules as any)[name] = { ...module };

    if (module.hono) {
      hono.route("/", module.hono);
    }
  });

  return instance;
};

export const createModule = <TInstance, TExtras, TParams extends unknown[]>(
  moduleCreator: (...args: TParams) => Module<TInstance, TExtras>,
): ((...args: TParams) => Module<TInstance, TExtras>) => {
  return moduleCreator;
};
