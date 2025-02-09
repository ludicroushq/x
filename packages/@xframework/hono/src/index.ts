import type { Hono } from "hono";
import { SyncAdapter } from "x/adapter";

export class HonoAdapter<
  UserHonoInstance extends Hono,
> extends SyncAdapter<UserHonoInstance> {
  public hono: UserHonoInstance;
  constructor({ hono }: { hono: UserHonoInstance }) {
    super();
    this.hono = hono;
  }

  export() {
    return this.hono;
  }
}
