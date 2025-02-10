import { describe, expect, it } from "vitest";
import { createX } from "..";
import { SyncAdapter } from "../adapter";
// sync-adapter.test.ts
describe("Sync Adapter Tests", () => {
  class TestSyncAdapter extends SyncAdapter<number> {
    constructor(private value: number) {
      super();
    }
    export() {
      return this.value;
    }
  }

  class InitializableSyncAdapter extends SyncAdapter<number> {
    private initialized = false;

    init() {
      this.initialized = true;
    }

    export() {
      return this.initialized ? 1 : 0;
    }
  }

  class ErrorSyncAdapter extends SyncAdapter<never> {
    init() {
      throw new Error("Init error");
    }

    // @ts-expect-error test
    export() {
      throw new Error("Export error");
    }
  }

  it("should build sync adapter chain", () => {
    const result = createX()
      .syncAdapter("test1", () => new TestSyncAdapter(1))
      .syncAdapter("test2", ({ test1 }) => new TestSyncAdapter(test1 + 1))
      .build();

    expect(result.test1).toBe(1);
    expect(result.test2).toBe(2);
  });

  it("should call init on sync adapters", () => {
    const result = createX()
      .syncAdapter("test", () => new InitializableSyncAdapter())
      .build();

    expect(result.test).toBe(1);
  });

  it("should throw on init error in sync adapter", () => {
    expect(() =>
      createX()
        .syncAdapter("error", () => new ErrorSyncAdapter())
        .build(),
    ).toThrow("Init error");
  });

  it("should call init method on sync adapter", () => {
    let initCalled = false;

    class TestSyncAdapter extends SyncAdapter<string> {
      init() {
        initCalled = true;
      }

      export() {
        return "test";
      }
    }

    createX()
      .syncAdapter("test", () => new TestSyncAdapter())
      .build();

    expect(initCalled).toBe(true);
  });
});
