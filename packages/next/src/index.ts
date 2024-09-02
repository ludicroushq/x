import type { FetchEventLike } from "hono/types";
import { handle } from "hono/vercel";
import type { NextRequest } from "next/server";
import type { X } from "@xframework/core";
import { Module } from "@xframework/core/module";

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

// eslint-disable-next-line no-restricted-syntax
export class NextModule extends Module {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  install(x: X) {
    const createHandlers = (): Handlers => {
      const handlers = {} as Handlers;

      (
        ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const
      ).forEach((method) => {
        handlers[method] = handle(x._.hono);
      });

      return handlers;
    };

    return {
      handlers: createHandlers(),
    };
  }
}
