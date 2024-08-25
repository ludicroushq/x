import { X as CoreX } from '@xframework/core';
import { XConfig, XInstance, Module } from '@xframework/types';
import { NextApiRequest, NextApiResponse } from 'next';

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

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
      handlers[method] = async (req, res) => {
        // Implement Next.js specific handling logic here
        res.status(501).json({ message: 'Not implemented' });
      };
    });
    return handlers;
  };

  return {
    ...coreInstance,
    handlers: createHandlers(),
  };
}
