import { Hono } from "hono";
import type { NextRequest } from "next/server";
import type { NextAuthResult } from "next-auth";
import { createAuthModule } from "..";

export const createAuthJsModule = createAuthModule((auth: NextAuthResult) => {
  const { handlers } = auth;
  const hono = new Hono();

  hono.all("/auth/*", async (c) => {
    const { method, raw } = c.req;

    if (!Object.hasOwn(handlers, method)) {
      return c.newResponse(null, 405);
    }

    const handler = handlers[method as keyof typeof handlers];

    const res = await handler(raw as unknown as NextRequest);

    return res;
  });

  return {
    id: "authjs/next",
    register: () => auth,
    hono,
  };
});
