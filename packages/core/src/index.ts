import { Hono } from "hono";
import type { Module, ModuleFactory, Modules } from "./module";

type XWithModules<T extends Modules> = Omit<
  X<T>,
  "get" | "module" | "use" | "start"
> &
  T;

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export class X<RegisteredModules extends Modules = {}> {
  private modules: Map<string, Module> = new Map();
  private cache: Map<string, unknown> = new Map();
  private workers: (() => Promise<void> | void)[] = [];
  public readonly _: { hono: Hono; worker: () => Promise<void> };

  constructor() {
    this._ = {
      hono: new Hono().basePath("/x"),
      worker: async () => {
        await Promise.all(this.workers.map((worker) => worker()));
      },
    };
  }

  module<ModuleKey extends string, ModuleReturnType>(
    key: ModuleKey,
    factory: ModuleFactory<RegisteredModules, ModuleReturnType>,
  ): X<RegisteredModules & { [Key in ModuleKey]: ModuleReturnType }> {
    const moduleInstance = factory(this as X<RegisteredModules>);

    void moduleInstance.initialize();
    this._.hono.route("/", moduleInstance.hono);
    this.modules.set(key, moduleInstance);
    this.workers.push(moduleInstance.worker.bind(moduleInstance));

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

  private get<ModuleKey extends keyof RegisteredModules>(
    key: ModuleKey,
  ): RegisteredModules[ModuleKey] {
    if (!this.cache.has(key as string)) {
      const module = this.modules.get(key as string);

      if (module) {
        const installedModule = module.install(this);

        this.cache.set(key as string, installedModule);
      } else {
        throw new Error(`Module "${String(key)}" not found`);
      }
    }

    return this.cache.get(key as string) as RegisteredModules[ModuleKey];
  }

  start(): XWithModules<RegisteredModules> {
    return new Proxy(this, {
      get: (target, prop: string | symbol) => {
        if (prop in target) {
          return (target as X<RegisteredModules>)[
            prop as keyof X<RegisteredModules>
          ];
        }

        return target.get(prop as keyof RegisteredModules);
      },
    }) as XWithModules<RegisteredModules>;
  }
}
