import { describe, expect, it, vi } from "vitest";
import { createX } from "../";
import { AsyncAdapter } from "../adapter";

// async-adapter.test.ts
describe("Async Adapter Tests", () => {
  class TestAsyncAdapter extends AsyncAdapter<string> {
    constructor(private value: string) {
      super();
    }
    export() {
      return this.value;
    }
  }

  class InitializableAsyncAdapter extends AsyncAdapter<string> {
    private initialized = false;

    async init() {
      await new Promise((resolve) => setTimeout(resolve, 10));
      this.initialized = true;
    }

    export() {
      return this.initialized ? "initialized" : "not-initialized";
    }
  }

  class ErrorAsyncAdapter extends AsyncAdapter<never> {
    async init() {
      throw new Error("Async init error");
    }

    // @ts-expect-error test
    export() {
      throw new Error("Async export error");
    }
  }

  it("should build async adapter chain", async () => {
    const result = await createX()
      .asyncAdapter("test1", () => new TestAsyncAdapter("hello"))
      .asyncAdapter(
        "test2",
        async ({ test1 }) => new TestAsyncAdapter(test1 + " world"),
      )
      .build();

    expect(result.test1).toBe("hello");
    expect(result.test2).toBe("hello world");
  });

  it("should call init on async adapters", async () => {
    const result = await createX()
      .asyncAdapter("test", () => new InitializableAsyncAdapter())
      .build();

    expect(result.test).toBe("initialized");
  });

  it("should throw on init error in async adapter", async () => {
    await expect(
      createX()
        .asyncAdapter("error", () => new ErrorAsyncAdapter())
        .build(),
    ).rejects.toThrow('Failed to initialize adapter "error"');
  });

  it("should handle non-AdapterError errors during async build", async () => {
    const x = createX().asyncAdapter(
      "test",
      () => new TestAsyncAdapter("test"),
    );
    const error = new Error("Unknown error");
    vi.spyOn(x as any, "buildAsync").mockImplementation(() => {
      throw error;
    });

    await expect(x.build()).rejects.toThrow("Failed to build adapters");
  });
});
