import { describe, it, expect } from "vitest";
import { createX } from "../index";
import { SyncAdapter, AsyncAdapter, AdapterError } from "../adapter";

// Test Adapters
class CounterAdapter extends SyncAdapter<number> {
  export() {
    return 42;
  }
}

class ConfiguredAdapter extends SyncAdapter<number> {
  private value: number;

  constructor(config: { value: number }) {
    super();
    this.value = config.value;
  }

  export() {
    return this.value;
  }
}

class InitializableAdapter extends SyncAdapter<number> {
  private initialized = false;
  private value: number;

  constructor(config: { value: number }) {
    super();
    this.value = config.value;
  }

  init() {
    this.initialized = true;
  }

  export() {
    if (!this.initialized) {
      throw new Error("Adapter not initialized");
    }
    return this.value;
  }
}

class AsyncAdapterTest extends AsyncAdapter<string> {
  private deps: { counter: number };
  private initialized = false;

  constructor(deps: { counter: number }) {
    super();
    this.deps = deps;
  }

  async init() {
    await new Promise((resolve) => setTimeout(resolve, 10));
    this.initialized = true;
  }

  export() {
    if (!this.initialized) {
      throw new Error("Adapter not initialized");
    }
    return `Value: ${this.deps.counter}`;
  }
}

class AsyncConfiguredAdapter extends AsyncAdapter<string> {
  private value: string;
  private initCalled = false;

  constructor(config: { value: string }) {
    super();
    this.value = config.value;
  }

  async init() {
    this.initCalled = true;
  }

  export() {
    if (!this.initCalled) {
      throw new Error("Init not called");
    }
    return this.value;
  }
}

describe("Sync Adapters", () => {
  it("should create a sync adapter without config", () => {
    const factory = createX().syncAdapter({
      name: "counter",
      adapter: CounterAdapter,
    });

    const result = factory.build();
    expect(result.counter).toBe(42);
  });

  it("should create a sync adapter with config", () => {
    const factory = createX().syncAdapter({
      name: "configuredCounter",
      adapter: ConfiguredAdapter,
      config: () => ({ value: 100 }),
    });

    const result = factory.build();
    expect(result.configuredCounter).toBe(100);
  });

  it("should properly initialize sync adapters", () => {
    const factory = createX().syncAdapter({
      name: "initializable",
      adapter: InitializableAdapter,
      config: () => ({ value: 123 }),
    });

    const result = factory.build();
    expect(result.initializable).toBe(123);
  });

  it("should maintain adapter instances in result", () => {
    const factory = createX().syncAdapter({
      name: "counter",
      adapter: CounterAdapter,
    });

    const result = factory.build();
    expect(result._.adapters.counter).toBeInstanceOf(CounterAdapter);
  });

  it("should handle duplicate adapter names by using the last one", () => {
    const factory = createX()
      .syncAdapter({
        name: "counter",
        adapter: CounterAdapter,
      })
      .syncAdapter({
        name: "counter",
        adapter: ConfiguredAdapter,
        config: () => ({ value: 100 }),
      });

    const result = factory.build();
    expect(result.counter).toBe(100);
    expect(result._.adapters.counter).toBeInstanceOf(ConfiguredAdapter);
  });
});

describe("Async Adapters", () => {
  it("should create an async adapter", async () => {
    const factory = createX()
      .syncAdapter({
        name: "counter",
        adapter: CounterAdapter,
      })
      .asyncAdapter({
        name: "async",
        adapter: AsyncAdapterTest,
        config: (x) => ({ counter: x.counter }),
      });

    const result = await factory.build();
    expect(result.async).toBe("Value: 42");
  });

  it("should properly initialize async adapters", async () => {
    const factory = createX().asyncAdapter({
      name: "asyncConfigured",
      adapter: AsyncConfiguredAdapter,
      config: () => ({ value: "test" }),
    });

    const result = await factory.build();
    expect(result.asyncConfigured).toBe("test");
  });

  it("should automatically convert sync build to async when using async adapter", async () => {
    const factory = createX().asyncAdapter({
      name: "async",
      adapter: AsyncAdapterTest,
      config: () => ({ counter: 42 }),
    });

    const result = await factory.build();
    expect(result.async).toBe("Value: 42");
  });

  it("should maintain async adapter instances in result", async () => {
    const factory = createX().asyncAdapter({
      name: "asyncConfigured",
      adapter: AsyncConfiguredAdapter,
      config: () => ({ value: "test" }),
    });

    const result = await factory.build();
    expect(result._.adapters.asyncConfigured).toBeInstanceOf(
      AsyncConfiguredAdapter,
    );
  });

  it("should handle errors in async init", async () => {
    class AsyncInitErrorAdapter extends AsyncAdapter<never> {
      async init() {
        throw new Error("Init failed");
      }
      export() {
        return undefined as never;
      }
    }

    const factory = createX().asyncAdapter({
      name: "error",
      adapter: AsyncInitErrorAdapter,
    });

    await expect(factory.build()).rejects.toThrow(AdapterError);
  });
});

describe("Factory Composition", () => {
  it("should compose multiple factories", async () => {
    const first = createX().syncAdapter({
      name: "counter",
      adapter: CounterAdapter,
    });

    const second = createX()
      .use(first)
      .asyncAdapter({
        name: "async",
        adapter: AsyncAdapterTest,
        config: (x) => ({ counter: x.counter }),
      });

    const result = await second.build();
    expect(result.counter).toBe(42);
    expect(result.async).toBe("Value: 42");
  });

  it("should handle multiple levels of composition", async () => {
    const first = createX().syncAdapter({
      name: "counter",
      adapter: CounterAdapter,
    });

    const second = createX().asyncAdapter({
      name: "asyncConfigured",
      adapter: AsyncConfiguredAdapter,
      config: () => ({ value: "test" }),
    });

    const third = createX()
      .use(first)
      .use(second)
      .asyncAdapter({
        name: "async",
        adapter: AsyncAdapterTest,
        config: (x) => ({ counter: x.counter }),
      });

    const result = await third.build();
    expect(result.counter).toBe(42);
    expect(result.asyncConfigured).toBe("test");
    expect(result.async).toBe("Value: 42");
  });

  it("should preserve async state when composing", async () => {
    const async = createX().asyncAdapter({
      name: "async",
      adapter: AsyncAdapterTest,
      config: () => ({ counter: 42 }),
    });

    const sync = createX().syncAdapter({
      name: "counter",
      adapter: CounterAdapter,
    });

    const composed = createX().use(sync).use(async);
    const result = await composed.build();
    expect(result.counter).toBe(42);
    expect(result.async).toBe("Value: 42");
  });

  it("should handle circular dependencies", () => {
    const factory = createX()
      .syncAdapter({
        name: "a",
        adapter: ConfiguredAdapter,
        config: () => ({ value: 1 }),
      })
      .syncAdapter({
        name: "b",
        adapter: ConfiguredAdapter,
        config: (x) => ({ value: x.a + 1 }),
      });

    const result = factory.build();
    expect(result.a).toBe(1);
    expect(result.b).toBe(2);
  });
});

describe("Error Handling", () => {
  class ErrorAdapter extends SyncAdapter<never> {
    export(): never {
      throw new Error("Adapter error");
    }
  }

  class AsyncErrorAdapter extends AsyncAdapter<never> {
    async init() {
      throw new Error("Async init error");
    }

    export(): never {
      throw new Error("Should not reach here");
    }
  }

  it("should wrap sync adapter errors", () => {
    const factory = createX().syncAdapter({
      name: "error",
      adapter: ErrorAdapter,
    });

    expect(() => factory.build()).toThrow(AdapterError);
  });

  it("should wrap async adapter errors", async () => {
    const factory = createX().asyncAdapter({
      name: "error",
      adapter: AsyncErrorAdapter,
    });

    await expect(factory.build()).rejects.toThrow(AdapterError);
  });

  it("should include adapter name in error", () => {
    const factory = createX().syncAdapter({
      name: "error",
      adapter: ErrorAdapter,
    });

    try {
      factory.build();
    } catch (error) {
      expect(error instanceof AdapterError).toBe(true);
      if (error instanceof AdapterError) {
        expect(error.adapterName).toBe("error");
      }
    }
  });

  it("should preserve error cause", () => {
    const factory = createX().syncAdapter({
      name: "error",
      adapter: ErrorAdapter,
    });

    try {
      factory.build();
    } catch (error) {
      if (error instanceof AdapterError) {
        expect(error.cause).toBeInstanceOf(Error);
        expect((error.cause as Error).message).toBe("Adapter error");
      }
    }
  });

  it("should handle errors in config functions", () => {
    const factory = createX().syncAdapter({
      name: "error",
      adapter: ConfiguredAdapter,
      config: () => {
        throw new Error("Config error");
      },
    });

    expect(() => factory.build()).toThrow(AdapterError);
  });
});

describe("Type Safety", () => {
  it("should enforce config requirements", () => {
    // We're testing that these would fail type checking
    // The actual runtime test is just a placeholder
    const factory = createX().syncAdapter({
      name: "counter",
      adapter: CounterAdapter,
    });

    expect(factory).toBeDefined();
  });

  it("should type dependencies correctly", () => {
    const factory = createX()
      .syncAdapter({
        name: "counter",
        adapter: CounterAdapter,
      })
      .asyncAdapter({
        name: "async",
        adapter: AsyncAdapterTest,
        config: (x) => ({ counter: x.counter }),
      });

    expect(factory).toBeDefined();
  });

  it("should preserve type information through composition", () => {
    const first = createX().syncAdapter({
      name: "counter",
      adapter: CounterAdapter,
    });

    const second = createX()
      .use(first)
      .asyncAdapter({
        name: "async",
        adapter: AsyncAdapterTest,
        config: (x) => {
          // Type checking - this should compile
          const counter: number = x.counter;
          return { counter };
        },
      });

    expect(second).toBeDefined();
  });
});

describe("Initialization Order", () => {
  it("should initialize adapters in order of registration", async () => {
    const initOrder: string[] = [];

    class OrderedSyncAdapter extends SyncAdapter<number> {
      constructor(private name: string) {
        super();
      }

      init() {
        initOrder.push(`sync:${this.name}`);
      }

      export() {
        return 42;
      }
    }

    class OrderedAsyncAdapter extends AsyncAdapter<number> {
      constructor(private name: string) {
        super();
      }

      async init() {
        await new Promise((resolve) => setTimeout(resolve, 10));
        initOrder.push(`async:${this.name}`);
      }

      export() {
        return 42;
      }
    }

    const factory = createX()
      .syncAdapter({
        name: "first",
        adapter: OrderedSyncAdapter,
        config: () => "first",
      })
      .asyncAdapter({
        name: "second",
        adapter: OrderedAsyncAdapter,
        config: () => "second",
      })
      .syncAdapter({
        name: "third",
        adapter: OrderedSyncAdapter,
        config: () => "third",
      });

    await factory.build();
    expect(initOrder).toEqual(["sync:first", "async:second", "sync:third"]);
  });

  it("should handle multiple async adapters with different timings", async () => {
    const initOrder: string[] = [];

    class TimedAsyncAdapter extends AsyncAdapter<number> {
      constructor(config: { name: string; delay: number }) {
        super();
        this.name = config.name;
        this.delay = config.delay;
      }

      private name: string;
      private delay: number;

      async init() {
        await new Promise((resolve) => setTimeout(resolve, this.delay));
        initOrder.push(`async:${this.name}`);
      }

      export() {
        return 42;
      }
    }

    const factory = createX()
      .asyncAdapter({
        name: "slow",
        adapter: TimedAsyncAdapter,
        config: () => ({ name: "slow", delay: 30 }),
      })
      .asyncAdapter({
        name: "fast",
        adapter: TimedAsyncAdapter,
        config: () => ({ name: "fast", delay: 10 }),
      })
      .asyncAdapter({
        name: "medium",
        adapter: TimedAsyncAdapter,
        config: () => ({ name: "medium", delay: 20 }),
      });

    await factory.build();
    // Despite different timings, initialization order should be preserved
    expect(initOrder).toEqual(["async:slow", "async:fast", "async:medium"]);
  });

  it("should handle mixed sync/async initialization with dependencies", async () => {
    const initOrder: string[] = [];
    const values: Record<string, number> = {};

    class DependentSyncAdapter extends SyncAdapter<number> {
      constructor(config: { name: string; dep?: string }) {
        super();
        this.name = config.name;
        this.dep = config.dep;
      }

      private name: string;
      private dep?: string;

      init() {
        initOrder.push(`sync:${this.name}`);
        values[this.name] = this.dep ? (values[this.dep] ?? 0) + 1 : 1;
      }

      export() {
        const value = values[this.name];
        if (typeof value !== "number") {
          throw new Error(`Value for ${this.name} not initialized`);
        }
        return value;
      }
    }

    class DependentAsyncAdapter extends AsyncAdapter<number> {
      constructor(config: { name: string; dep?: string }) {
        super();
        this.name = config.name;
        this.dep = config.dep;
      }

      private name: string;
      private dep?: string;

      async init() {
        await new Promise((resolve) => setTimeout(resolve, 10));
        initOrder.push(`async:${this.name}`);
        values[this.name] = this.dep ? (values[this.dep] ?? 0) + 1 : 1;
      }

      export() {
        const value = values[this.name];
        if (typeof value !== "number") {
          throw new Error(`Value for ${this.name} not initialized`);
        }
        return value;
      }
    }

    const factory = createX()
      .syncAdapter({
        name: "first",
        adapter: DependentSyncAdapter,
        config: () => ({ name: "first" }),
      })
      .asyncAdapter({
        name: "second",
        adapter: DependentAsyncAdapter,
        config: () => ({ name: "second", dep: "first" }),
      })
      .syncAdapter({
        name: "third",
        adapter: DependentSyncAdapter,
        config: () => ({ name: "third", dep: "second" }),
      });

    const result = await factory.build();
    expect(initOrder).toEqual(["sync:first", "async:second", "sync:third"]);
    expect(result.first).toBe(1);
    expect(result.second).toBe(2);
    expect(result.third).toBe(3);
  });

  it("should handle concurrent async initialization", async () => {
    const initOrder: string[] = [];
    const initStart: string[] = [];

    class ConcurrentAsyncAdapter extends AsyncAdapter<number> {
      constructor(config: { name: string; delay: number }) {
        super();
        this.name = config.name;
        this.delay = config.delay;
      }

      private name: string;
      private delay: number;

      async init() {
        initStart.push(`start:${this.name}`);
        await new Promise((resolve) => setTimeout(resolve, this.delay));
        initOrder.push(`done:${this.name}`);
      }

      export() {
        return 42;
      }
    }

    const factory = createX()
      .asyncAdapter({
        name: "a",
        adapter: ConcurrentAsyncAdapter,
        config: () => ({ name: "a", delay: 30 }),
      })
      .asyncAdapter({
        name: "b",
        adapter: ConcurrentAsyncAdapter,
        config: () => ({ name: "b", delay: 10 }),
      })
      .asyncAdapter({
        name: "c",
        adapter: ConcurrentAsyncAdapter,
        config: () => ({ name: "c", delay: 20 }),
      });

    await factory.build();

    // Initialization should start in registration order
    expect(initStart).toEqual(["start:a", "start:b", "start:c"]);

    // But completion order might be different due to different delays
    // We don't test the exact order since it's timing dependent
    expect(initOrder).toHaveLength(3);
    expect(initOrder.map((x) => x.split(":")[1])).toEqual(
      expect.arrayContaining(["a", "b", "c"]),
    );
  });
});
