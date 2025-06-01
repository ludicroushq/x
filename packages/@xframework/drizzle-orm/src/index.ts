import { SyncAdapter } from "@xframework/x/adapter";

export class DrizzleAdapter<TDatabase> extends SyncAdapter<TDatabase> {
  public db: TDatabase;

  constructor({ db }: { db: TDatabase }) {
    super();
    this.db = db;
  }

  export() {
    return this.db;
  }
}
