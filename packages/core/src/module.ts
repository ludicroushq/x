import { Hono } from "hono";
import type { XFramework } from ".";

export class Module {
  hono: Hono;

  constructor() {
    this.hono = new Hono();
  }

  install(x: XFramework): unknown {
    throw new Error("install method must be implemented");
  }

  initialize(): void | Promise<void> {}

  worker(): void | Promise<void> {}
}

export type Modules = Record<string, unknown>;

export type ModuleFactory<CurrentModules extends Modules, ReturnType> = (
  x: XFramework<CurrentModules>,
) => Module & { install: (x: XFramework) => ReturnType };
