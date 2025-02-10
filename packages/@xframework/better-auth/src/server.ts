import { SyncAdapter } from "@xframework/x/adapter";
import type { betterAuth } from "better-auth";

export class BetterAuthServerAdapter<
  UserBetterAuthInstance extends ReturnType<typeof betterAuth>,
> extends SyncAdapter<UserBetterAuthInstance> {
  public auth: UserBetterAuthInstance;
  constructor({ auth }: { auth: UserBetterAuthInstance }) {
    super();
    this.auth = auth;
  }

  export() {
    return this.auth;
  }
}
