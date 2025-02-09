import { expect, it, describe } from "vitest";
import { createX } from "x";
import { ConfigAdapter } from "../index";

describe("ConfigAdapter", () => {
  // Test with a simple config object
  const simpleConfig = {
    apiKey: "test-api-key",
    url: "https://api.example.com",
    version: 1,
  } as const;

  it("should properly initialize and export config instance", () => {
    const adapter = new ConfigAdapter({
      config: simpleConfig,
    });

    expect(adapter.config).toBe(simpleConfig);
    expect(adapter.export()).toBe(simpleConfig);
  });

  it("should integrate with X framework", () => {
    const x = createX()
      .syncAdapter(
        "config",
        () =>
          new ConfigAdapter({
            config: simpleConfig,
          }),
      )
      .build();

    expect(x._.adapters.config).toBeInstanceOf(ConfigAdapter);
    expect(x.config).toBe(simpleConfig);
    expect(x.config.apiKey).toBe("test-api-key");
    expect(x.config.url).toBe("https://api.example.com");
    expect(x.config.version).toBe(1);
  });

  // Test with a nested config object
  const nestedConfig = {
    api: {
      key: "test-api-key",
      endpoints: {
        users: "/api/users",
        posts: "/api/posts",
      },
      version: 2,
    },
    database: {
      host: "localhost",
      port: 5432,
      credentials: {
        username: "admin",
        password: "secret",
      },
    },
    features: {
      darkMode: true,
      beta: {
        enabled: false,
        whitelist: ["user1", "user2"],
      },
    },
  } as const;

  it("should handle nested config objects", () => {
    const adapter = new ConfigAdapter({
      config: nestedConfig,
    });

    expect(adapter.config).toBe(nestedConfig);
    expect(adapter.export()).toBe(nestedConfig);
  });

  it("should provide type-safe access to nested config through X framework", () => {
    const x = createX()
      .syncAdapter(
        "config",
        () =>
          new ConfigAdapter({
            config: nestedConfig,
          }),
      )
      .build();

    expect(x.config.api.key).toBe("test-api-key");
    expect(x.config.api.endpoints.users).toBe("/api/users");
    expect(x.config.database.credentials.username).toBe("admin");
    expect(x.config.features.beta.whitelist).toEqual(["user1", "user2"]);
  });

  // Test with different config types
  it("should handle configs with various types", () => {
    const mixedConfig = {
      string: "test",
      number: 42,
      boolean: true,
      array: [1, 2, 3],
      date: new Date("2024-01-01"),
      nullable: null as null | string,
      optional: undefined as undefined | number,
      tuple: ["id", 123] as const,
      union: "value" as "value" | "other",
    };

    const x = createX()
      .syncAdapter(
        "config",
        () =>
          new ConfigAdapter({
            config: mixedConfig,
          }),
      )
      .build();

    expect(x.config.string).toBe("test");
    expect(x.config.number).toBe(42);
    expect(x.config.boolean).toBe(true);
    expect(x.config.array).toEqual([1, 2, 3]);
    expect(x.config.date).toBeInstanceOf(Date);
    expect(x.config.nullable).toBeNull();
    expect(x.config.optional).toBeUndefined();
    expect(x.config.tuple).toEqual(["id", 123]);
    expect(x.config.union).toBe("value");
  });

  // Test compile-time type constraints
  it("should have proper TypeScript type constraints", () => {
    // These would fail at compile time, but work at runtime
    // @ts-expect-error Config must be a record of string keys
    const nullConfig = new ConfigAdapter({ config: null });
    expect(nullConfig.config).toBe(null);

    // @ts-expect-error Config must be a record of string keys
    const undefinedConfig = new ConfigAdapter({ config: undefined });
    expect(undefinedConfig.config).toBe(undefined);

    // @ts-expect-error Config must be a record of string keys
    const numberConfig = new ConfigAdapter({ config: 42 });
    expect(numberConfig.config).toBe(42);

    // @ts-expect-error Config must be a record of string keys
    const stringConfig = new ConfigAdapter({ config: "not an object" });
    expect(stringConfig.config).toBe("not an object");
  });
});
