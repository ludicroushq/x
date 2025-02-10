import { HonoAdapter } from "@xframework/hono";
import { createX } from "@xframework/x";
import { hono } from "./hono";

export const x = createX().syncAdapter(
  "hono",
  () =>
    new HonoAdapter({
      app: hono,
    }),
);
