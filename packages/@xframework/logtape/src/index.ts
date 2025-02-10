import { SyncAdapter } from "@xframework/x/adapter";
import type { Logger } from "@logtape/logtape";
import { getLogger } from "@logtape/logtape";

export class LogTapeAdapter extends SyncAdapter<Logger> {
  public logger: Logger;

  constructor() {
    super();
    this.logger = getLogger();
  }

  export(): Logger {
    return this.logger;
  }
}
