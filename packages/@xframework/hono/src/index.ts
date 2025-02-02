import type { Hono } from "hono";
import { SyncAdapter } from "x/adapter";

export class HonoAdapter extends SyncAdapter {
  public app: Hono;
  constructor({ app }: { app: Hono }) {
    super();
    this.app = app;
  }
}
