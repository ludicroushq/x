/* eslint-disable no-restricted-syntax */
import { DbModule } from ".";

export class DrizzleModule<T> extends DbModule {
  private db: T;

  constructor(db: T) {
    super();
    this.db = db;
  }

  install(): T {
    return this.db;
  }
}
