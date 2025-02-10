import { SyncAdapter } from "@xframework/x/adapter";

export class ConfigAdapter<
  UserConfigInstance extends Record<string, unknown>,
> extends SyncAdapter<UserConfigInstance> {
  public config: UserConfigInstance;
  constructor({ config }: { config: UserConfigInstance }) {
    super();
    this.config = config;
  }

  export() {
    return this.config;
  }
}

// In the future create a more advanced config adapter with storage (sync, and async)
