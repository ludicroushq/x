import { Module } from "@xframework/core/module";
import type { NextAuthResult } from "next-auth";
import type { NextRequest } from "next/server";
import type { AuthModule } from "..";

export class AuthJsModule<Auth extends NextAuthResult>
  extends Module
  implements AuthModule
{
  private auth: Auth;

  constructor(auth: Auth) {
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

  install(): Auth {
    return this.auth;
  }
}
