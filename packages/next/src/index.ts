import type { FetchEventLike } from "hono/types";
import { handle } from "hono/vercel";
import type { NextRequest } from "next/server";
import { X as CoreX } from "@xframework/core";
import type { Module, XConfig, XInstance } from "@xframework/core/types";

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

type NextXInstance<TModules extends Record<string, Module<unknown, unknown>>> =
  XInstance<TModules> & {
    handlers: Handlers;
  };

// eslint-disable-next-line @typescript-eslint/naming-convention
export const X = <TModules extends Record<string, Module<unknown, unknown>>>(
  config: XConfig<TModules>,
): NextXInstance<TModules> => {
  const coreInstance = CoreX(config);

  const createHandlers = (): Handlers => {
    const handlers = {} as Handlers;

    (
      ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const
    ).forEach((method) => {
      handlers[method] = handle(coreInstance._.hono);
    });

    return handlers;
  };

  return {
    ...coreInstance,
    handlers: createHandlers(),
  };
};
