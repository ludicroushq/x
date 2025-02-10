import { createEnv } from "@t3-oss/env-core";
import { createEnv as createNextEnv } from "@t3-oss/env-nextjs";
import { createEnv as createNuxtEnv } from "@t3-oss/env-nuxt";
import { expect, it } from "vitest";
import { createX } from "@xframework/x";
import { z } from "zod";
import { T3EnvAdapter } from "../index";

it("should work with basic env-core setup", () => {
  // Create a basic env configuration
  const env = createEnv({
    server: {
      DATABASE_URL: z.string().url(),
      API_KEY: z.string().min(1),
    },
    runtimeEnv: {
      DATABASE_URL: "postgresql://localhost:5432/mydb",
      API_KEY: "secret-key",
    },
    skipValidation: true, // Skip for testing
  });

  const x = createX()
    .syncAdapter("env", () => new T3EnvAdapter({ env }))
    .build();

  expect(x.env.DATABASE_URL).toBe("postgresql://localhost:5432/mydb");
  expect(x.env.API_KEY).toBe("secret-key");
  expect(x._.adapters.env).toBeInstanceOf(T3EnvAdapter);
});

it("should work with Next.js environment setup", () => {
  // Create a Next.js-style env configuration
  const env = createNextEnv({
    server: {
      NODE_ENV: z.enum(["development", "production", "test"]),
      DATABASE_URL: z.string().url(),
    },
    client: {
      NEXT_PUBLIC_API_URL: z.string().url(),
    },
    runtimeEnv: {
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://localhost:5432/nextapp",
      NEXT_PUBLIC_API_URL: "https://api.example.com",
    },
    skipValidation: true,
  });

  const x = createX()
    .syncAdapter("env", () => new T3EnvAdapter({ env }))
    .build();

  expect(x.env.NODE_ENV).toBe("development");
  expect(x.env.DATABASE_URL).toBe("postgresql://localhost:5432/nextapp");
  expect(x.env.NEXT_PUBLIC_API_URL).toBe("https://api.example.com");
});

it("should work with Nuxt environment setup", () => {
  // Create a Nuxt-style env configuration
  const env = createNuxtEnv({
    server: {
      NUXT_API_SECRET: z.string(),
      NUXT_MONGODB_URI: z.string().url(),
    },
    client: {
      NUXT_PUBLIC_API_BASE: z.string().url(),
    },
    skipValidation: true, // Skip for testing
  });

  process.env.NUXT_API_SECRET = "super-secret";
  process.env.NUXT_MONGODB_URI = "mongodb://localhost:27017/nuxtapp";
  process.env.NUXT_PUBLIC_API_BASE = "https://api.nuxtapp.com";

  const x = createX()
    .syncAdapter("env", () => new T3EnvAdapter({ env }))
    .build();

  expect(x.env.NUXT_API_SECRET).toBe("super-secret");
  expect(x.env.NUXT_MONGODB_URI).toBe("mongodb://localhost:27017/nuxtapp");
  expect(x.env.NUXT_PUBLIC_API_BASE).toBe("https://api.nuxtapp.com");
});

it("should handle validation errors", () => {
  expect(() => {
    createEnv({
      server: {
        DATABASE_URL: z.string().url(),
      },
      runtimeEnv: {
        DATABASE_URL: "not-a-valid-url", // This should fail validation
      },
    });
  }).toThrow();
});

it("should handle missing required variables", () => {
  expect(() => {
    createEnv({
      server: {
        REQUIRED_VAR: z.string(),
      },
      runtimeEnv: {
        // REQUIRED_VAR is missing
      },
    });
  }).toThrow();
});
