import { describe, it, expect } from "vitest";
import { AsyncAdapter, SyncAdapter } from "../adapter";
import { createX } from "..";

describe("Async Factory Functionality", () => {
  class TestAsyncAdapter extends AsyncAdapter<string> {
    private value: string;

    constructor(
      value: string,
      private delay?: number,
    ) {
      super();
      this.value = value;
    }

    async init() {
      if (this.delay) {
        await new Promise((resolve) => setTimeout(resolve, this.delay));
      }
    }

    export() {
      return this.value;
    }
  }

  it("should handle async adapter initialization", async () => {
    const factory = createX().asyncAdapter(
      "test",
      () => new TestAsyncAdapter("async", 100),
    );

    const x = await factory;
    expect(x.test).toBe("async");
    expect(x._.adapters.test).toBeInstanceOf(TestAsyncAdapter);
  });

  it("should support mixing sync and async adapters", async () => {
    class TestSyncAdapter extends SyncAdapter<string> {
      constructor(private value: string) {
        super();
      }
      export() {
        return this.value;
      }
    }

    const factory = createX()
      .syncAdapter("sync", () => new TestSyncAdapter("sync"))
      .asyncAdapter("async", () => new TestAsyncAdapter("async"));

    const x = await factory;
    expect(x.sync).toBe("sync");
    expect(x.async).toBe("async");
    expect(x._.adapters.sync).toBeInstanceOf(TestSyncAdapter);
    expect(x._.adapters.async).toBeInstanceOf(TestAsyncAdapter);
  });

  it("should handle async adapter dependencies", async () => {
    let firstInit = false;

    class FirstAdapter extends AsyncAdapter<string> {
      async init() {
        await new Promise((resolve) => setTimeout(resolve, 50));
        firstInit = true;
      }
      export() {
        return "first";
      }
    }

    class SecondAdapter extends AsyncAdapter<string> {
      constructor(private container: any) {
        super();
      }

      async init() {
        expect(firstInit).toBe(true);
        expect(this.container.first).toBe("first");
      }

      export() {
        return "second";
      }
    }

    const factory = createX()
      .asyncAdapter("first", () => new FirstAdapter())
      .asyncAdapter("second", (container) => new SecondAdapter(container));

    const x = await factory;
    expect(x.first).toBe("first");
    expect(x.second).toBe("second");
  });
});
