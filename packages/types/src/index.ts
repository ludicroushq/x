export type Module<TInstance, TExtras = {}> = {
  id: string;
  register: () => TInstance;
} & TExtras;

export type XConfig<TModules extends Record<string, Module<unknown, unknown>>> = {
  modules: TModules;
};

export type ModuleToInstance<T> = T extends Module<infer Instance, unknown> ? Instance : never;

export type XInstance<TModules extends Record<string, Module<unknown, unknown>>> = {
  [K in keyof TModules]: ModuleToInstance<TModules[K]>;
} & {
  modules: {
    [K in keyof TModules]: TModules[K];
  };
};
