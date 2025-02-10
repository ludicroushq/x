import { describe, expect, it } from "vitest";
import { createX } from "..";
import { SyncAdapter } from "../adapter";

interface Config {
  key: string;
  value: number;
}

class ConfigAdapter extends SyncAdapter<Config> {
  export(): Config {
    return { key: "test", value: 42 };
  }
}

class NumberAdapter extends SyncAdapter<number> {
  constructor(private value: number) {
    super();
  }
  export() {
    return this.value;
  }
}

class StringAdapter extends SyncAdapter<string> {
  constructor(private deps: { number: number }) {
    super();
  }
  export() {
    return `value: ${this.deps.number}`;
  }
}

// type-system.test.ts
describe("Type System Tests", () => {
  it("should properly type exports", () => {
    const result = createX()
      .syncAdapter("config", () => new ConfigAdapter())
      .build();

    // TypeScript should recognize these properties
    expect(result.config.key).toBe("test");
    expect(result.config.value).toBe(42);
  });

  it("should properly type dependencies", () => {
    class DependentAdapter extends SyncAdapter<string> {
      constructor(private deps: { config: { value: number } }) {
        super();
      }
      export() {
        return `value: ${this.deps.config.value}`;
      }
    }

    const result = createX()
      .syncAdapter("config", () => new ConfigAdapter())
      .syncAdapter("dependent", (deps) => new DependentAdapter(deps))
      .build();

    expect(result.dependent).toBe("value: 42");
  });

  it("should maintain type safety with use()", () => {
    const first = createX().syncAdapter("num", () => new NumberAdapter(1));
    const second = createX()
      .use(first)
      .syncAdapter("str", ({ num }) => new StringAdapter({ number: num }));

    // TypeScript should recognize these types
    type SecondType = typeof second;
    type BuildType = Awaited<ReturnType<SecondType["build"]>>;

    const result = second.build() as BuildType;
    expect(result.num).toBeDefined();
    expect(result.str).toBeDefined();
  });
});
