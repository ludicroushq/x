import { X as CoreX } from '@xframework/core';
import { XConfig, XInstance, Module } from '@xframework/core/types';
import { NextRequest } from 'next/server'
import { handle } from 'hono/vercel'
import { FetchEventLike } from 'hono/types';

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

type Handler = (req: NextRequest, requestContext: FetchEventLike) => Response | Promise<Response>;

type Handlers = {
  [key in HTTPMethod]: Handler;
};

type NextXInstance<TModules extends Record<string, Module<unknown, unknown>>> = XInstance<TModules> & {
  handlers: Handlers;
};

export function X<TModules extends Record<string, Module<unknown, unknown>>>(
  config: XConfig<TModules>
): NextXInstance<TModules> {
  const coreInstance = CoreX(config);

  const createHandlers = (): Handlers => {
    const handlers = {} as Handlers;
    (['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const).forEach((method) => {
      handlers[method] = handle(coreInstance.hono);
    });
    return handlers;
  };

  return {
    ...coreInstance,
    handlers: createHandlers(),
  };
}
