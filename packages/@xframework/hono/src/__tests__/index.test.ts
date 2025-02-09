import { Hono } from "hono";
import { expect, it, describe } from "vitest";
import { createX } from "x";
import { HonoAdapter } from "../index";
import { hc } from "hono/client";

describe("HonoAdapter", () => {
  it("should properly initialize and export Hono instance", () => {
    const app = new Hono();
    const adapter = new HonoAdapter({ app });

    expect(adapter.app).toBe(app);
    expect(adapter.export()).toBe(app);
  });

  it("should preserve Hono types and route handlers", () => {
    const app = new Hono().get("/hello/:name", (c) => {
      const name = c.req.param("name");
      return c.json({ message: `Hello ${name}!` });
    });

    const x = createX()
      .syncAdapter("hono", () => new HonoAdapter({ app }))
      .build();

    type AppType = typeof x.hono;
    const client = hc<AppType>("/");
    expect(client.hello[":name"].$get).toBeDefined();
  });

  it("should work with middleware and complex routes", () => {
    const app = new Hono();

    // Add routes with different methods and params
    app.get("/api/users/:id", (c) => c.json({ id: c.req.param("id") }));
    app.post("/api/users", (c) => c.json({ status: "created" }));

    const x = createX()
      .syncAdapter("hono", () => new HonoAdapter({ app }))
      .build();

    expect(x.hono.routes).toHaveLength(2);
  });
});
