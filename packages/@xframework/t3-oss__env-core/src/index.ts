import { SyncAdapter } from "x/adapter";

type EnvConfig = {
  env: Record<string, any>;
};

export class T3EnvAdapter<T extends EnvConfig> extends SyncAdapter<T["env"]> {
  constructor(private config: T) {
    super();
  }

  export() {
    return this.config.env;
  }
}
