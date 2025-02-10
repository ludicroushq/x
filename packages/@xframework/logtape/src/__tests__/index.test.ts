import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { LogTapeAdapter } from "../index";
import { configure, getConsoleSink, getLogger } from "@logtape/logtape";
import { createX } from "@xframework/x";

describe("LogTapeAdapter", () => {
  beforeEach(async () => {
    await configure({
      reset: true,
      sinks: {
        console: getConsoleSink(),
      },
      loggers: [
        {
          category: [],
          sinks: ["console"],
          lowestLevel: "debug",
        },
      ],
    });
  });

  afterEach(async () => {
    await configure({
      reset: true,
      sinks: {},
      loggers: [],
    });
  });

  it("should properly initialize and export logger instance", () => {
    const adapter = new LogTapeAdapter();
    const logger = adapter.logger;

    expect(logger).toBeDefined();
    expect(Array.isArray(logger.category)).toBe(true);
    expect(logger.category).toHaveLength(0);
    expect(logger.parent).toBe(null);
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.fatal).toBe("function");
  });

  it("should export logger with getLogger function", () => {
    const adapter = new LogTapeAdapter();
    const logger = adapter.logger;

    expect(logger).toBeDefined();
    const categoryLogger = getLogger(["test-category"]);
    expect(categoryLogger.category).toEqual(["test-category"]);
  });

  it("should integrate with X framework", () => {
    const adapter = new LogTapeAdapter();
    const x = createX()
      .syncAdapter("logger", () => adapter)
      .build();

    expect(x._.adapters.logger).toBeInstanceOf(LogTapeAdapter);
    expect(x.logger).toBeDefined();
    expect(typeof x.logger.debug).toBe("function");
    expect(typeof x.logger.info).toBe("function");
    expect(typeof x.logger.warn).toBe("function");
    expect(typeof x.logger.error).toBe("function");
    expect(typeof x.logger.fatal).toBe("function");
  });

  it("should properly log messages", () => {
    const logger = getLogger([]);

    expect(() => {
      logger.debug("Debug message", { level: "debug" });
      logger.info("Info message", { level: "info" });
      logger.warn("Warning message", { level: "warn" });
      logger.error("Error message", { level: "error" });
      logger.fatal("Fatal message", { level: "fatal" });
    }).not.toThrow();
  });

  it("should support getting new logger instances", () => {
    const newLogger = getLogger(["test-category"]);
    expect(newLogger).toBeDefined();
    expect(newLogger.category).toEqual(["test-category"]);
  });

  it("should support child loggers with categories", () => {
    const componentLogger = getLogger(["component"]);
    expect(componentLogger).toBeDefined();
    expect(componentLogger.category).toEqual(["component"]);

    const childLogger = getLogger(["component", "test"]);
    expect(childLogger).toBeDefined();
    expect(childLogger.category).toEqual(["component", "test"]);
    // Logtape maintains parent relationships
    expect(childLogger.parent).toBeDefined();
    expect(childLogger.parent?.category).toEqual(["component"]);
  });

  it("should support with method for adding context", () => {
    const logger = getLogger([]);
    const loggerWithContext = logger.with({ requestId: "123" });
    expect(loggerWithContext).toBeDefined();
    expect(() => {
      loggerWithContext.info("Test message with context");
    }).not.toThrow();
  });

  it("should respect log levels", async () => {
    const logger = getLogger([]);

    // Configure logger to only show info and above
    await configure({
      reset: true,
      sinks: {
        console: getConsoleSink(),
      },
      loggers: [
        {
          category: [],
          sinks: ["console"],
          lowestLevel: "info",
        },
      ],
    });

    expect(() => {
      logger.debug("This debug message should be filtered");
      logger.info("This info message should go through");
      logger.warn("This warning message should go through");
      logger.error("This error message should go through");
      logger.fatal("This fatal message should go through");
    }).not.toThrow();
  });

  it("should handle nested child loggers", () => {
    const level1 = getLogger(["level1"]);
    const level2 = getLogger(["level1", "level2"]);
    const level3 = getLogger(["level1", "level2", "level3"]);

    expect(level1.category).toEqual(["level1"]);
    expect(level2.category).toEqual(["level1", "level2"]);
    expect(level3.category).toEqual(["level1", "level2", "level3"]);

    // Logtape maintains parent relationships
    expect(level1.parent).toBeDefined();
    expect(level1.parent?.category).toEqual([]);
    expect(level2.parent).toBeDefined();
    expect(level2.parent?.category).toEqual(["level1"]);
    expect(level3.parent).toBeDefined();
    expect(level3.parent?.category).toEqual(["level1", "level2"]);
  });
});
