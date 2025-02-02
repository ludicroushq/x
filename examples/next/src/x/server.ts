import { HonoAdapter } from "@xframework/hono";
import { createX } from "x";
import { hono } from "./hono";

export const x = createX().syncAdapter(
  "hono",
  () =>
    new HonoAdapter({
      app: hono,
    }),
);
