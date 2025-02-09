import type { Hono } from "hono";
import { SyncAdapter } from "x/adapter";

export class HonoAdapter<
  UserHonoInstance extends Hono,
> extends SyncAdapter<UserHonoInstance> {
  public app: UserHonoInstance;
  constructor({ app }: { app: UserHonoInstance }) {
    super();
    this.app = app;
  }

  export() {
    return this.app;
  }
}
