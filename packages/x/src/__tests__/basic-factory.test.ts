import { describe, it, expect } from "vitest";
import { SyncAdapter } from "../adapter";
import { createX } from "..";

describe("Basic Factory Functionality", () => {
  class TestSyncAdapter extends SyncAdapter<string> {
    private value: string;

    constructor(value: string) {
      super();
      this.value = value;
    }

    export() {
      return this.value;
    }
  }

  it("should create a factory with no adapters", () => {
    const x = createX();
    expect(x).toBeDefined();
    expect(x._).toBeDefined();
    expect(x._.adapters).toEqual({});
  });

  it("should add a sync adapter", () => {
    const x = createX().syncAdapter("test", () => new TestSyncAdapter("hello"));

    expect(x.test).toBe("hello");
    expect(x._.adapters.test).toBeInstanceOf(TestSyncAdapter);
  });

  it("should support multiple adapters", () => {
    const x = createX()
      .syncAdapter("first", () => new TestSyncAdapter("one"))
      .syncAdapter("second", () => new TestSyncAdapter("two"));

    expect(x.first).toBe("one");
    expect(x.second).toBe("two");
    expect(x._.adapters.first).toBeInstanceOf(TestSyncAdapter);
    expect(x._.adapters.second).toBeInstanceOf(TestSyncAdapter);
  });

  it("should initialize adapters in order", () => {
    const initOrder: string[] = [];

    class InitTestAdapter extends SyncAdapter<void> {
      constructor(private name: string) {
        super();
      }

      init() {
        initOrder.push(this.name);
      }

      export() {}
    }

    createX()
      .syncAdapter("first", () => new InitTestAdapter("first"))
      .syncAdapter("second", () => new InitTestAdapter("second"));

    expect(initOrder).toEqual(["first", "second"]);
  });

  it("should support adapter dependencies", () => {
    const x = createX()
      .syncAdapter("base", () => new TestSyncAdapter("base"))
      .syncAdapter("dependent", (container) => {
        expect(container.base).toBe("base");
        expect(container._.adapters.base).toBeInstanceOf(TestSyncAdapter);
        return new TestSyncAdapter("dependent");
      });

    expect(x.base).toBe("base");
    expect(x.dependent).toBe("dependent");
  });
});
