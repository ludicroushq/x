import { describe, it, expect } from "vitest";
import { createX } from "..";
import { SyncAdapter, AsyncAdapter } from "../adapter";

describe("Error Handling", () => {
  it("should throw when sync adapter returns promise from init", () => {
    class BadAdapter extends SyncAdapter<void> {
      init() {
        return Promise.resolve();
      }
      export() {}
    }

    expect(() => {
      createX().syncAdapter("bad", () => new BadAdapter());
    }).toThrow(/returned a Promise/);
  });

  it("should handle adapter initialization errors", async () => {
    class ErrorAdapter extends AsyncAdapter<void> {
      async init() {
        throw new Error("Init failed");
      }
      export() {}
    }

    const factory = createX().asyncAdapter("error", () => new ErrorAdapter());

    await expect(factory).rejects.toThrow("Init failed");
  });

  it("should handle export errors", () => {
    class ErrorAdapter extends SyncAdapter<void> {
      export() {
        throw new Error("Export failed");
      }
    }

    expect(() => {
      createX().syncAdapter("error", () => new ErrorAdapter());
    }).toThrow("Export failed");
  });

  it("should handle dependency errors gracefully", () => {
    class DependentAdapter extends SyncAdapter<string> {
      constructor(private container: any) {
        super();
      }

      export() {
        // @ts-ignore - Intentionally accessing non-existent property
        return this.container.nonexistent.value;
      }
    }

    expect(() => {
      createX().syncAdapter(
        "dependent",
        (container) => new DependentAdapter(container),
      );
    }).toThrow();
  });
});
