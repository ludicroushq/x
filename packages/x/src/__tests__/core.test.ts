import { describe, expect, it } from "vitest";
import { AdapterError } from "../core/adapters";
import { createX } from "../";

describe("Core Adapter Functionality", () => {
  it("should create an empty X instance", () => {
    const x = createX();
    expect(x).toBeDefined();
    expect(x.build()).toEqual({ _: { adapters: {} } });
  });

  it("should throw AdapterError with correct properties", () => {
    const error = new AdapterError(
      "test message",
      "test-adapter",
      new Error("cause"),
    );
    expect(error.message).toBe("test message");
    expect(error.adapterName).toBe("test-adapter");
    expect(error.cause).toBeInstanceOf(Error);
    expect(error.name).toBe("AdapterError");
  });
});
