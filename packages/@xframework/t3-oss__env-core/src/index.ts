import { SyncAdapter } from "x/adapter";

export class T3EnvAdapter<
  T extends Record<string, unknown>,
> extends SyncAdapter<T> {
  constructor(private config: { env: T }) {
    super();
  }

  export() {
    return this.config.env;
  }
}
