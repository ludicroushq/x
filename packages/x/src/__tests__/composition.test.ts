import { describe, it, expect } from "vitest";
import { createX } from "..";
import { SyncAdapter, AsyncAdapter } from "../adapter";

describe("Factory Composition", () => {
  class TestAdapter extends SyncAdapter<string> {
    constructor(private value: string) {
      super();
    }
    export() {
      return this.value;
    }
  }

  it("should compose sync factories", () => {
    const first = createX().syncAdapter("one", () => new TestAdapter("first"));

    const second = createX().syncAdapter(
      "two",
      () => new TestAdapter("second"),
    );

    const combined = first.use(second);

    expect(combined.one).toBe("first");
    expect(combined.two).toBe("second");
    expect(combined._.adapters.one).toBeInstanceOf(TestAdapter);
    expect(combined._.adapters.two).toBeInstanceOf(TestAdapter);
  });

  it("should compose sync and async factories", async () => {
    class AsyncTestAdapter extends AsyncAdapter<string> {
      constructor(private value: string) {
        super();
      }
      export() {
        return this.value;
      }
    }

    const sync = createX().syncAdapter("sync", () => new TestAdapter("sync"));

    const async = createX().asyncAdapter(
      "async",
      () => new AsyncTestAdapter("async"),
    );

    const combined = await sync.use(async);

    expect(combined.sync).toBe("sync");
    expect(combined.async).toBe("async");
    expect(combined._.adapters.sync).toBeInstanceOf(TestAdapter);
    expect(combined._.adapters.async).toBeInstanceOf(AsyncTestAdapter);
  });

  it("should maintain initialization order in composed factories", () => {
    const initOrder: string[] = [];

    class OrderedAdapter extends SyncAdapter<void> {
      constructor(private name: string) {
        super();
      }

      init() {
        initOrder.push(this.name);
      }

      export() {}
    }

    const first = createX().syncAdapter("one", () => new OrderedAdapter("one"));

    const second = createX().syncAdapter(
      "two",
      () => new OrderedAdapter("two"),
    );

    first.use(second);

    expect(initOrder).toEqual(["one", "two"]);
  });

  it("should allow accessing composed factory adapters through dependencies", () => {
    const base = createX().syncAdapter("base", () => new TestAdapter("base"));

    const combined = createX()
      .use(base)
      .syncAdapter("extended", (container) => {
        expect(container.base).toBe("base");
        return new TestAdapter("extended");
      });

    expect(combined.base).toBe("base");
    expect(combined.extended).toBe("extended");
    expect(combined._.adapters.base).toBeInstanceOf(TestAdapter);
    expect(combined._.adapters.extended).toBeInstanceOf(TestAdapter);
  });
});
