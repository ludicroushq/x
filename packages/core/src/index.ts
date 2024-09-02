/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable no-restricted-syntax */
import { Hono } from "hono";
import type { Module, ModuleFactory, Modules } from "./module";

export class X<RegisteredModules extends Modules = {}> {
  private modules: Map<string, Module> = new Map();
  private cache: Map<string, unknown> = new Map();
  public readonly _: { hono: Hono };

  constructor() {
    this._ = { hono: new Hono() };
  }

  module<ModuleKey extends string, ModuleReturnType>(
    key: ModuleKey,
    factory: ModuleFactory<RegisteredModules, ModuleReturnType>,
  ): X<RegisteredModules & { [Key in ModuleKey]: ModuleReturnType }> {
    const moduleInstance = factory(this as X<RegisteredModules>);

    // eslint-disable-next-line no-void
    void moduleInstance.initialize();
    this.modules.set(key, moduleInstance);

    return this as X<
      RegisteredModules & { [Key in ModuleKey]: ModuleReturnType }
    >;
  }

  use<NewModules extends Modules>(
    other: X<NewModules>,
  ): X<RegisteredModules & NewModules> {
    other.modules.forEach((module, key) => {
      this.modules.set(key, module);
    });

    return this as X<RegisteredModules & NewModules>;
  }

  get<ModuleKey extends keyof RegisteredModules>(
    key: ModuleKey,
  ): RegisteredModules[ModuleKey] {
    if (!this.cache.has(key as string)) {
      const module = this.modules.get(key as string);

      if (module) {
        const installedModule = module.install(this);

        this.cache.set(key as string, installedModule);
        this._.hono.route("/", module.hono);
      } else {
        throw new Error(`Module "${String(key)}" not found`);
      }
    }

    return this.cache.get(key as string) as RegisteredModules[ModuleKey];
  }
}
