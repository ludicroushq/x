import { describe, expect, it } from "vitest";
import { createX } from "../";
import { AsyncAdapter, SyncAdapter } from "../adapter";

// composition.test.ts
describe("Adapter Composition Tests", () => {
  class NumberAdapter extends SyncAdapter<number> {
    constructor(private value: number) {
      super();
    }
    export() {
      return this.value;
    }
  }

  class StringAdapter extends AsyncAdapter<string> {
    constructor(private deps: { number: number }) {
      super();
    }
    export() {
      return `value: ${this.deps.number}`;
    }
  }

  it("should compose sync adapters using use()", () => {
    const first = createX().syncAdapter("num1", () => new NumberAdapter(1));
    const second = createX().syncAdapter("num2", () => new NumberAdapter(2));

    const result = createX().use(first).use(second).build();

    expect(result.num1).toBe(1);
    expect(result.num2).toBe(2);
  });

  it("should compose sync and async adapters", async () => {
    const sync = createX().syncAdapter("number", () => new NumberAdapter(42));
    const result = await createX()
      .use(sync)
      .asyncAdapter("string", ({ number }) => new StringAdapter({ number }))
      .build();

    expect(result.number).toBe(42);
    expect(result.string).toBe("value: 42");
  });

  it("should throw when using async adapter in sync build", () => {
    const async = createX().asyncAdapter(
      "async",
      () => new StringAdapter({ number: 1 }),
    );

    expect(() =>
      createX()
        .use(async)
        .syncAdapter("sync", () => new NumberAdapter(1))
        .build(),
    ).toThrow('Cannot use async adapter "async" in sync build');
  });
});
