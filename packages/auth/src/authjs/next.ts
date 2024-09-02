/* eslint-disable no-restricted-syntax */
import type { NextRequest } from "next/server";
import type { NextAuthResult } from "next-auth";
import { AuthModule } from "..";

export class AuthJsModule extends AuthModule {
  private auth: NextAuthResult;

  constructor(auth: NextAuthResult) {
    super();
    this.auth = auth;

    const { handlers } = auth;

    this.hono.all("/auth/*", async (c) => {
      const { method, raw } = c.req;

      if (!Object.hasOwn(handlers, method)) {
        return c.newResponse(null, 405);
      }

      const handler = handlers[method as keyof typeof handlers];

      const res = await handler(raw as unknown as NextRequest);

      return res;
    });
  }

  install(): NextAuthResult {
    return this.auth;
  }
}
