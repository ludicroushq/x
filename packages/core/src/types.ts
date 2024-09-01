import type { Hono } from "hono";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type Module<TInstance, TExtras = {}> = {
  id: string;
  register: () => TInstance;
  initialize?: () => void | Promise<void>;
  worker?: () => void | Promise<void>;
  hono?: Hono;
} & TExtras;

export interface XConfig<
  TModules extends Record<string, Module<unknown, unknown>>,
> {
  modules: TModules;
}

export type ModuleToInstance<T> =
  T extends Module<infer Instance, unknown> ? Instance : never;

export type XInstance<
  TModules extends Record<string, Module<unknown, unknown>>,
> = {
  [K in keyof TModules]: ModuleToInstance<TModules[K]>;
} & {
  _: {
    modules: {
      [K in keyof TModules]: TModules[K];
    };
    hono: Hono;
    startWorker: () => Promise<void>;
  };
};
