import { describe, it, expect, vi } from "vitest";
import { createX } from "..";
import { SyncAdapter, AsyncAdapter } from "../adapter";

describe("Adapter Lifecycle", () => {
  it("should initialize adapters only once", () => {
    const initCount = vi.fn();

    class InitOnceAdapter extends SyncAdapter<string> {
      init() {
        initCount();
      }

      export() {
        return "value";
      }
    }

    const factory = createX().syncAdapter("test", () => new InitOnceAdapter());

    // Access multiple times
    expect(factory.test).toBe("value");
    expect(factory.test).toBe("value");
    expect(factory.test).toBe("value");

    expect(initCount).toHaveBeenCalledTimes(1);
  });

  it("should initialize async adapters only once", async () => {
    const initCount = vi.fn();

    class AsyncInitAdapter extends AsyncAdapter<string> {
      async init() {
        await new Promise((resolve) => setTimeout(resolve, 10));
        initCount();
      }

      export() {
        return "value";
      }
    }

    const factory = createX().asyncAdapter(
      "test",
      () => new AsyncInitAdapter(),
    );

    const instance = await factory;

    // Access multiple times
    expect(instance.test).toBe("value");
    expect(instance.test).toBe("value");
    expect(instance.test).toBe("value");

    expect(initCount).toHaveBeenCalledTimes(1);
  });

  it("should create adapter instances only once", () => {
    const createCount = vi.fn();

    class SingletonAdapter extends SyncAdapter<string> {
      constructor() {
        super();
        createCount();
      }

      export() {
        return "value";
      }
    }

    const factory = createX().syncAdapter("test", () => new SingletonAdapter());

    // Access multiple times
    expect(factory.test).toBe("value");
    expect(factory.test).toBe("value");
    expect(factory.test).toBe("value");

    expect(createCount).toHaveBeenCalledTimes(1);
  });

  it("should handle async adapter creation timing", async () => {
    const events: string[] = [];

    class TimedAdapter extends AsyncAdapter<string> {
      private exported = false;

      constructor(
        private name: string,
        private delay: number,
      ) {
        super();
      }

      async init() {
        await new Promise((resolve) => setTimeout(resolve, this.delay));
        events.push(`init ${this.name}`);
      }

      export() {
        if (!this.exported) {
          events.push(`export ${this.name}`);
          this.exported = true;
        }
        return this.name;
      }
    }

    const factory = createX()
      .asyncAdapter("first", () => new TimedAdapter("first", 10))
      .asyncAdapter("second", () => new TimedAdapter("second", 20))
      .asyncAdapter("third", () => new TimedAdapter("third", 30));

    // Wait for initialization to complete
    const instance = await factory;

    // Verify initialization order - should be sequential
    expect(events).toEqual([
      "init first",
      "export first",
      "init second",
      "export second",
      "init third",
      "export third",
    ]);

    // Access values in any order - should not trigger new exports
    expect(instance.third).toBe("third");
    expect(instance.first).toBe("first");
    expect(instance.second).toBe("second");

    // Events should not have changed
    expect(events).toEqual([
      "init first",
      "export first",
      "init second",
      "export second",
      "init third",
      "export third",
    ]);
  });

  it("should handle adapter state changes", () => {
    class StatefulAdapter extends SyncAdapter {
      private count = 0;

      export() {
        return {
          getCount: () => this.count,
        };
      }

      increment() {
        this.count++;
      }
    }

    const factory = createX().syncAdapter(
      "counter",
      () => new StatefulAdapter(),
    );

    // Each export should return a new value
    const adapter = factory._.adapters.counter as StatefulAdapter;
    expect(factory.counter.getCount()).toBe(0);
    adapter.increment();
    expect(factory.counter.getCount()).toBe(1);
    adapter.increment();
    expect(factory.counter.getCount()).toBe(2);
    adapter.increment();
    expect(factory.counter.getCount()).toBe(3);
    adapter.increment();
    expect(factory.counter.getCount()).toBe(4);
  });

  it("should handle async adapter state changes", async () => {
    class AsyncStatefulAdapter extends AsyncAdapter {
      private count = 0;

      async init() {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      export() {
        return {
          getCount: () => this.count,
        };
      }

      increment() {
        this.count++;
      }
    }

    const factory = createX().asyncAdapter(
      "counter",
      () => new AsyncStatefulAdapter(),
    );

    const instance = await factory;

    // Each export should return a new value
    const adapter = instance._.adapters.counter as AsyncStatefulAdapter;
    expect(instance.counter.getCount()).toBe(0);
    adapter.increment();
    expect(instance.counter.getCount()).toBe(1);
    adapter.increment();
    expect(instance.counter.getCount()).toBe(2);
    adapter.increment();
    expect(instance.counter.getCount()).toBe(3);
    adapter.increment();
    expect(instance.counter.getCount()).toBe(4);
  });
});
