import { SyncAdapter } from "@xframework/x/adapter";

export class T3EnvAdapter<
  T extends Record<string, unknown>,
> extends SyncAdapter<T> {
  public env: T;

  constructor({ env }: { env: T }) {
    super();
    this.env = env;
  }

  export() {
    return this.env;
  }
}
