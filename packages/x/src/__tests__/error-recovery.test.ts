import { describe, it, expect, vi } from "vitest";
import { createX } from "..";
import { SyncAdapter, AsyncAdapter } from "../adapter";

describe("Error Recovery", () => {
  it("should handle sync adapter initialization errors", () => {
    class ErrorAdapter extends SyncAdapter<string> {
      init() {
        throw new Error("Initialization failed");
      }

      export() {
        return "value";
      }
    }

    let error: Error | undefined;
    try {
      const factory = createX().syncAdapter("error", () => new ErrorAdapter());
      // Access the property to trigger initialization
      const _ = factory.error;
      expect(_).toBeDefined();
    } catch (e) {
      error = e as Error;
    }
    expect(error).toBeDefined();
    expect(error!.message).toBe("Initialization failed");
  });

  it("should handle async adapter initialization errors", async () => {
    class AsyncErrorAdapter extends AsyncAdapter<string> {
      async init() {
        throw new Error("Async initialization failed");
      }

      export() {
        return "value";
      }
    }

    let error: Error | undefined;
    try {
      const factory = createX().asyncAdapter(
        "error",
        () => new AsyncErrorAdapter(),
      );
      await factory;
    } catch (e) {
      error = e as Error;
    }
    expect(error).toBeDefined();
    expect(error!.message).toBe(
      'Failed to initialize adapter "error": Async initialization failed',
    );
  });

  it("should handle sync adapter export errors", () => {
    class ExportErrorAdapter extends SyncAdapter<string> {
      export(): string {
        throw new Error("Export failed");
      }
    }

    let error: Error | undefined;
    try {
      const factory = createX().syncAdapter(
        "error",
        () => new ExportErrorAdapter(),
      );
      // Access the property to trigger export
      const _ = factory.error;
      expect(_).toBeDefined();
    } catch (e) {
      error = e as Error;
    }
    expect(error).toBeDefined();
    expect(error!.message).toBe(
      'Failed to export adapter "error": Export failed',
    );
  });

  it("should handle async adapter export errors", async () => {
    class AsyncExportErrorAdapter extends AsyncAdapter<string> {
      export(): string {
        throw new Error("Async export failed");
      }
    }

    let error: Error | undefined;
    try {
      const factory = createX().asyncAdapter(
        "error",
        () => new AsyncExportErrorAdapter(),
      );
      const instance = await factory;
      // Access the property to trigger export
      const _ = instance.error;
      expect(_).toBeDefined();
    } catch (e) {
      error = e as Error;
    }
    expect(error).toBeDefined();
    expect(error!.message).toBe(
      'Failed to export adapter "error": Async export failed',
    );
  });

  it("should handle errors in dependency chains", () => {
    class BaseAdapter extends SyncAdapter<string> {
      export() {
        return "base";
      }
    }

    class DependentErrorAdapter extends SyncAdapter<string> {
      constructor(private dependency: string) {
        super();
      }

      export(): string {
        throw new Error(`Error processing ${this.dependency}`);
      }
    }

    let error: Error | undefined;
    try {
      const factory = createX()
        .syncAdapter("base", () => new BaseAdapter())
        .syncAdapter("level1", (f) => new DependentErrorAdapter(f.base))
        .syncAdapter("level2", (f) => new DependentErrorAdapter(f.level1));
      // Access the property to trigger export
      const _ = factory.level1;
      expect(_).toBeDefined();
    } catch (e) {
      error = e as Error;
    }
    expect(error).toBeDefined();
    expect(error!.message).toBe(
      'Failed to export adapter "level1": Error processing base',
    );
  });

  it("should handle async errors in dependency chains", async () => {
    class BaseAdapter extends SyncAdapter<string> {
      export() {
        return "base";
      }
    }

    class AsyncDependentErrorAdapter extends AsyncAdapter<string> {
      constructor(private dependency: string) {
        super();
      }

      async init() {
        throw new Error(`Error initializing with ${this.dependency}`);
      }

      export() {
        return "value";
      }
    }

    let error: Error | undefined;
    try {
      const factory = createX()
        .syncAdapter("base", () => new BaseAdapter())
        .asyncAdapter("level1", (f) => new AsyncDependentErrorAdapter(f.base));
      await factory;
    } catch (e) {
      error = e as Error;
    }
    expect(error).toBeDefined();
    expect(error!.message).toBe(
      'Failed to initialize adapter "level1": Error initializing with base',
    );
  });

  it("should handle mixed sync/async errors in dependency chains", async () => {
    class BaseAdapter extends SyncAdapter<string> {
      export() {
        return "sync1";
      }
    }

    class MixedErrorAdapter extends AsyncAdapter<string> {
      constructor(private dependency: string) {
        super();
      }

      async init() {
        await new Promise((resolve) => setTimeout(resolve, 10));
        throw new Error(`Error initializing with ${this.dependency}`);
      }

      export() {
        return "value";
      }
    }

    let error: Error | undefined;
    try {
      const factory = createX()
        .syncAdapter("sync1", () => new BaseAdapter())
        .asyncAdapter("async1", (f) => new MixedErrorAdapter(f.sync1));
      await factory;
    } catch (e) {
      error = e as Error;
    }
    expect(error).toBeDefined();
    expect(error!.message).toBe(
      'Failed to initialize adapter "async1": Error initializing with sync1',
    );
  });

  it("should handle cleanup errors", () => {
    const cleanupError = new Error("Cleanup failed");
    const cleanupSpy = vi.fn().mockImplementation(() => {
      throw cleanupError;
    });

    class CleanupErrorAdapter extends SyncAdapter<string> {
      dispose() {
        try {
          cleanupSpy();
        } catch (error) {
          // Swallow the error
        }
      }

      export() {
        return "value";
      }
    }

    const factory = createX().syncAdapter(
      "cleanup",
      () => new CleanupErrorAdapter(),
    ) as unknown as {
      cleanup: string;
      _: { adapters: { cleanup: CleanupErrorAdapter } };
    };

    // Access the adapter to initialize it
    expect(factory.cleanup).toBe("value");

    // Cleanup should be called but error should be caught
    factory._.adapters.cleanup.dispose();
    expect(cleanupSpy).toHaveBeenCalled();
  });

  it("should handle async cleanup errors", async () => {
    const cleanupError = new Error("Async cleanup failed");
    const cleanupSpy = vi.fn().mockImplementation(() => {
      throw cleanupError;
    });

    class AsyncCleanupErrorAdapter extends AsyncAdapter<string> {
      dispose() {
        try {
          cleanupSpy();
        } catch (error) {
          // Swallow the error
        }
      }

      export() {
        return "value";
      }
    }

    const factory = createX().asyncAdapter(
      "cleanup",
      () => new AsyncCleanupErrorAdapter(),
    );

    const instance = (await factory) as unknown as {
      cleanup: string;
      _: { adapters: { cleanup: AsyncCleanupErrorAdapter } };
    };

    expect(instance.cleanup).toBe("value");

    // Cleanup should be called but error should be caught
    instance._.adapters.cleanup.dispose();
    expect(cleanupSpy).toHaveBeenCalled();
  });
});
