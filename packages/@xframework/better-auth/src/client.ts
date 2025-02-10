import { SyncAdapter } from "@xframework/x/adapter";
import type { createAuthClient } from "better-auth/client";

export class BetterAuthClientAdapter<
  UserBetterAuthInstance extends ReturnType<typeof createAuthClient>,
> extends SyncAdapter<UserBetterAuthInstance> {
  public authClient: UserBetterAuthInstance;
  constructor({ authClient }: { authClient: UserBetterAuthInstance }) {
    super();
    this.authClient = authClient;
  }

  export() {
    return this.authClient;
  }
}
