import { Hono } from "hono";
import { expect, it, describe } from "vitest";
import { createX } from "x";
import { HonoAdapter } from "../index";
import { hc } from "hono/client";

describe("HonoAdapter", () => {
  it("should properly initialize and export Hono instance", () => {
    const hono = new Hono();
    const adapter = new HonoAdapter({ hono });

    expect(adapter.hono).toBe(hono);
    expect(adapter.export()).toBe(hono);
  });

  it("should preserve Hono types and route handlers", () => {
    const hono = new Hono().get("/hello/:name", (c) => {
      const name = c.req.param("name");
      return c.json({ message: `Hello ${name}!` });
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const x = createX()
      .syncAdapter("hono", () => new HonoAdapter({ hono }))
      .build();

    type AppType = typeof x.hono;
    const client = hc<AppType>("/");
    expect(client.hello[":name"].$get).toBeDefined();
  });

  it("should work with middleware and complex routes", () => {
    const hono = new Hono()
      .get("/api/users/:id", (c) => c.json({ id: c.req.param("id") }))
      .post("/api/users", (c) => c.json({ status: "created" }));

    const x = createX()
      .syncAdapter("hono", () => new HonoAdapter({ hono }))
      .build();

    expect(x.hono.routes).toHaveLength(2);
  });
});
