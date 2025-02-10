import { expect, it, describe } from "vitest";
import { createX } from "@xframework/x";
import { BetterAuthClientAdapter } from "../client";
import { BetterAuthServerAdapter } from "../server";
import type { createAuthClient } from "better-auth/client";
import type { betterAuth } from "better-auth";

describe("BetterAuthClientAdapter", () => {
  const mockUser = {
    id: "test-id",
    email: "test@example.com",
    name: "Test User",
    image: null as string | null | undefined,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as const;

  const mockSession = {
    id: "session-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: mockUser.id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    token: "test-token",
    ipAddress: "127.0.0.1",
    userAgent: "test-agent",
  } as const;

  type MockResponse<T> = {
    ok: true;
    data: T;
    error: null;
    status: number;
  };

  const mockAuthClient = {
    signIn: {
      social: async () =>
        ({
          ok: true,
          data: {
            redirect: false as const,
            token: "test-token",
            url: undefined,
            user: mockUser,
          },
          error: null,
          status: 200,
        }) satisfies MockResponse<{
          redirect: boolean;
          token: string;
          url: undefined;
          user: typeof mockUser;
        }>,
      credentials: async () =>
        ({
          ok: true,
          data: {
            redirect: false as const,
            token: "test-token",
            url: undefined,
            user: mockUser,
          },
          error: null,
          status: 200,
        }) satisfies MockResponse<{
          redirect: boolean;
          token: string;
          url: undefined;
          user: typeof mockUser;
        }>,
    },
    signOut: async () =>
      ({
        ok: true,
        data: { success: true },
        error: null,
        status: 200,
      }) satisfies MockResponse<{ success: boolean }>,
    getSession: async () =>
      ({
        ok: true,
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
        status: 200,
      }) satisfies MockResponse<{
        user: typeof mockUser;
        session: typeof mockSession;
      }>,
  } as unknown as ReturnType<typeof createAuthClient>;

  it("should properly initialize and export auth client instance", () => {
    const adapter = new BetterAuthClientAdapter({
      authClient: mockAuthClient,
    });

    expect(adapter.authClient).toBe(mockAuthClient);
    expect(adapter.export()).toBe(mockAuthClient);
  });

  it("should integrate with X framework", () => {
    const x = createX()
      .syncAdapter(
        "auth",
        () =>
          new BetterAuthClientAdapter({
            authClient: mockAuthClient,
          }),
      )
      .build();

    expect(x._.adapters.auth).toBeInstanceOf(BetterAuthClientAdapter);
    expect(x.auth).toBe(mockAuthClient);
    expect(typeof x.auth.signIn.social).toBe("function");
    // @ts-expect-error credentials exists at runtime but TypeScript doesn't know about it
    expect(typeof x.auth.signIn.credentials).toBe("function");
    expect(typeof x.auth.signOut).toBe("function");
    expect(typeof x.auth.getSession).toBe("function");
  });
});

describe("BetterAuthServerAdapter", () => {
  const mockAuth = {
    handler: async (request: Request) => new Response(),
    api: {} as ReturnType<typeof betterAuth>["api"],
    options: {},
    $context: Promise.resolve({
      session: null,
      user: null,
    }),
    $metadata: {},
    $types: {},
    $Infer: {
      Session: {
        session: {
          id: "session-id",
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: "user-id",
          expiresAt: new Date(),
          token: "token",
          ipAddress: null,
          userAgent: null,
        },
        user: {
          id: "user-id",
          email: "test@example.com",
          name: "Test User",
          image: null,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
    $ERROR_CODES: {
      USER_NOT_FOUND: "USER_NOT_FOUND",
      FAILED_TO_CREATE_USER: "FAILED_TO_CREATE_USER",
      FAILED_TO_CREATE_SESSION: "FAILED_TO_CREATE_SESSION",
      FAILED_TO_UPDATE_USER: "FAILED_TO_UPDATE_USER",
      FAILED_TO_GET_SESSION: "FAILED_TO_GET_SESSION",
      INVALID_PASSWORD: "INVALID_PASSWORD",
      INVALID_EMAIL: "INVALID_EMAIL",
      EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
      INVALID_TOKEN: "INVALID_TOKEN",
      EXPIRED_TOKEN: "EXPIRED_TOKEN",
      INVALID_CODE: "INVALID_CODE",
      EXPIRED_CODE: "EXPIRED_CODE",
      INVALID_PROVIDER: "INVALID_PROVIDER",
      INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
      INVALID_SESSION: "INVALID_SESSION",
      EXPIRED_SESSION: "EXPIRED_SESSION",
      INVALID_REFRESH_TOKEN: "INVALID_REFRESH_TOKEN",
      EXPIRED_REFRESH_TOKEN: "EXPIRED_REFRESH_TOKEN",
      INVALID_RESET_TOKEN: "INVALID_RESET_TOKEN",
      EXPIRED_RESET_TOKEN: "EXPIRED_RESET_TOKEN",
      ACCOUNT_NOT_FOUND: "ACCOUNT_NOT_FOUND",
    },
  } as unknown as ReturnType<typeof betterAuth>;

  it("should properly initialize and export auth instance", () => {
    const adapter = new BetterAuthServerAdapter({
      auth: mockAuth,
    });

    expect(adapter.auth).toBe(mockAuth);
    expect(adapter.export()).toBe(mockAuth);
  });

  it("should integrate with X framework", () => {
    const x = createX()
      .syncAdapter(
        "auth",
        () =>
          new BetterAuthServerAdapter({
            auth: mockAuth,
          }),
      )
      .build();

    expect(x._.adapters.auth).toBeInstanceOf(BetterAuthServerAdapter);
    expect(x.auth).toBe(mockAuth);
    expect(typeof x.auth.handler).toBe("function");
    expect(x.auth.api).toBeDefined();
    expect(x.auth.options).toBeDefined();
  });
});
