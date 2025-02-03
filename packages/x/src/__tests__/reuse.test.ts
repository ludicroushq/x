import { describe, it, expect } from "vitest";
import { createX } from "..";
import { SyncAdapter, AsyncAdapter } from "../adapter";

describe("Adapter Reuse and Dependencies", () => {
  it("should reuse adapter instances across factories", () => {
    class SharedAdapter extends SyncAdapter<string> {
      export() {
        return "shared";
      }
    }

    const sharedAdapter = new SharedAdapter();

    const factory1 = createX().syncAdapter("shared", () => sharedAdapter);
    const factory2 = createX().syncAdapter("shared", () => sharedAdapter);

    expect(factory1.shared).toBe("shared");
    expect(factory2.shared).toBe("shared");
    expect(factory1._.adapters.shared).toBe(factory2._.adapters.shared);
  });

  it("should handle deep dependency chains", () => {
    class BaseAdapter extends SyncAdapter<number> {
      export() {
        return 1;
      }
    }

    class DependentAdapter extends SyncAdapter<number> {
      constructor(private dependency: number) {
        super();
      }

      export() {
        return this.dependency + 1;
      }
    }

    const factory = createX()
      .syncAdapter("base", () => new BaseAdapter())
      .syncAdapter("level1", (f) => new DependentAdapter(f.base))
      .syncAdapter("level2", (f) => new DependentAdapter(f.level1))
      .syncAdapter("level3", (f) => new DependentAdapter(f.level2))
      .syncAdapter("level4", (f) => new DependentAdapter(f.level3))
      .syncAdapter("level5", (f) => new DependentAdapter(f.level4));

    expect(factory.level5).toBe(6);
    expect(factory.level4).toBe(5);
    expect(factory.level3).toBe(4);
    expect(factory.level2).toBe(3);
    expect(factory.level1).toBe(2);
    expect(factory.base).toBe(1);
  });

  it("should handle async dependency chains", async () => {
    class BaseAdapter extends SyncAdapter<number> {
      export() {
        return 1;
      }
    }

    class AsyncDependentAdapter extends AsyncAdapter<number> {
      constructor(private dependency: number) {
        super();
      }

      async init() {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      export() {
        return this.dependency + 1;
      }
    }

    const factory = createX()
      .syncAdapter("base", () => new BaseAdapter())
      .asyncAdapter("level1", (f) => new AsyncDependentAdapter(f.base))
      .asyncAdapter("level2", (f) => new AsyncDependentAdapter(f.level1))
      .asyncAdapter("level3", (f) => new AsyncDependentAdapter(f.level2));

    const instance = await factory;

    expect(instance.level3).toBe(4);
    expect(instance.level2).toBe(3);
    expect(instance.level1).toBe(2);
    expect(instance.base).toBe(1);
  });

  it("should handle mixed sync/async dependency chains", async () => {
    class BaseAdapter extends SyncAdapter<number> {
      export() {
        return 1;
      }
    }

    class MixedDependentAdapter extends AsyncAdapter<number> {
      constructor(private dependency: number) {
        super();
      }

      async init() {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      export() {
        return this.dependency + 1;
      }
    }

    const factory = createX()
      .syncAdapter("sync1", () => new BaseAdapter())
      .asyncAdapter("async1", (f) => new MixedDependentAdapter(f.sync1))
      .syncAdapter("sync2", (f) => new BaseAdapter())
      .asyncAdapter("async2", (f) => new MixedDependentAdapter(f.sync2));

    const instance = await factory;

    expect(instance.async2).toBe(2);
    expect(instance.sync2).toBe(1);
    expect(instance.async1).toBe(2);
    expect(instance.sync1).toBe(1);
  });

  it("should handle parallel dependency chains", async () => {
    class BaseAdapter extends SyncAdapter<number> {
      export() {
        return 1;
      }
    }

    class ParallelAdapter extends AsyncAdapter<number> {
      constructor(private dependency: number) {
        super();
      }

      async init() {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      export() {
        return this.dependency + 1;
      }
    }

    const factory = createX()
      .syncAdapter("base", () => new BaseAdapter())
      .asyncAdapter("chain1-1", (f) => new ParallelAdapter(f.base))
      .asyncAdapter("chain1-2", (f) => new ParallelAdapter(f["chain1-1"]))
      .asyncAdapter("chain2-1", (f) => new ParallelAdapter(f.base))
      .asyncAdapter("chain2-2", (f) => new ParallelAdapter(f["chain2-1"]));

    const instance = await factory;

    expect(instance["chain1-2"]).toBe(3);
    expect(instance["chain1-1"]).toBe(2);
    expect(instance["chain2-2"]).toBe(3);
    expect(instance["chain2-1"]).toBe(2);
    expect(instance.base).toBe(1);
  });
});
