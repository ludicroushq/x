import type { XFramework } from "@xframework/core";
import { Module } from "@xframework/core/module";
import type { FetchEventLike } from "hono/types";
import { handle } from "hono/vercel";
import type { NextRequest } from "next/server";

export type HTTPMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

type Handler = (
  req: NextRequest,
  requestContext: FetchEventLike,
) => Response | Promise<Response>;

type Handlers = {
  [key in HTTPMethod]: Handler;
};

export class NextModule extends Module {
  install(x: XFramework) {
    const createHandlers = (): Handlers => {
      const handlers = {} as Handlers;

      for (const method of [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "HEAD",
        "OPTIONS",
      ]) {
        handlers[method as HTTPMethod] = handle(x._.hono);
      }

      return handlers;
    };

    return {
      handlers: createHandlers(),
    };
  }
}
