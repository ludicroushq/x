import { describe, expect, it } from "vitest";
import { createX } from "..";
import { AsyncAdapter, SyncAdapter } from "../adapter";

// error-handling.test.ts
describe("Error Handling Tests", () => {
  it("should handle synchronous factory errors", () => {
    expect(() =>
      createX()
        .syncAdapter("error", () => {
          throw new Error("Factory error");
        })
        .build(),
    ).toThrow("Factory error");
  });

  it("should handle asynchronous factory errors", async () => {
    await expect(
      createX()
        .asyncAdapter("error", async () => {
          throw new Error("Async factory error");
        })
        .build(),
    ).rejects.toThrow("Async factory error");
  });

  it("should handle export errors in sync adapters", () => {
    class ExportErrorAdapter extends SyncAdapter<never> {
      // @ts-expect-error test
      export() {
        throw new Error("Export error");
      }
    }

    expect(() =>
      createX()
        .syncAdapter("error", () => new ExportErrorAdapter())
        .build(),
    ).toThrow("Export error");
  });

  it("should handle export errors in async adapters", async () => {
    class AsyncExportErrorAdapter extends AsyncAdapter<never> {
      // @ts-expect-error test
      export() {
        throw new Error("Async export error");
      }
    }

    await expect(
      createX()
        .asyncAdapter("error", () => new AsyncExportErrorAdapter())
        .build(),
    ).rejects.toThrow("Async export error");
  });

  it("should handle async adapter returned in sync context", () => {
    class MismatchedAdapter extends AsyncAdapter<string> {
      export() {
        return "test";
      }
    }

    expect(() =>
      createX()
        // @ts-expect-error test
        .syncAdapter("error", () => new MismatchedAdapter())
        .build(),
    ).toThrow('Factory returned async adapter "error" in sync build');
  });
});
