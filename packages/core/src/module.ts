/* eslint-disable no-restricted-syntax */
import { Hono } from "hono";
import type { X } from ".";

export class Module {
  hono: Hono;

  constructor() {
    this.hono = new Hono();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  install(x: X): unknown {
    throw new Error("install method must be implemented");
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initialize(): void | Promise<void> {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  worker(): void | Promise<void> {}
}

export type Modules = Record<string, unknown>;

export type ModuleFactory<CurrentModules extends Modules, ReturnType> = (
  x: X<CurrentModules>,
) => Module & { install: (x: X) => ReturnType };
