import Stripe from "stripe";
import { expect, it, describe, vi } from "vitest";
import { createX } from "x";
import { StripeAdapter } from "../index";

describe("StripeAdapter", () => {
  const mockStripe = new Stripe("test_key", {
    apiVersion: "2025-01-27.acacia",
  });
  const webhookSecret = "whsec_test_secret";

  it("should properly initialize and export Stripe instance", () => {
    const adapter = new StripeAdapter({
      client: mockStripe,
      webhookSecret,
    });

    expect(adapter.client).toBe(mockStripe);
    const exported = adapter.export();
    expect(exported.client).toBe(mockStripe);
  });

  it("should preserve Stripe types", () => {
    const x = createX()
      .syncAdapter(
        "stripe",
        () => new StripeAdapter({ client: mockStripe, webhookSecret }),
      )
      .build();

    // Type check: verify that the exported client maintains Stripe's type information
    type ClientType = typeof x.stripe.client;
    type ExpectedType = Stripe;
    const _typeCheck: ClientType extends ExpectedType ? true : false = true;
    expect(_typeCheck).toBe(true);

    // Use x to avoid unused variable warning
    expect(x.stripe.client).toBeDefined();
  });

  it("should handle webhook requests correctly", async () => {
    const adapter = new StripeAdapter({
      client: mockStripe,
      webhookSecret,
    });

    // Mock Stripe's constructEvent method
    const mockEvent = {
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_123" } },
    };

    vi.spyOn(mockStripe.webhooks, "constructEvent").mockReturnValue(
      mockEvent as any,
    );

    // Create a mock request
    const mockRequest = new Request("https://api.example.com/webhook", {
      method: "POST",
      headers: {
        "stripe-signature": "test_signature",
      },
      body: JSON.stringify({ data: "test" }),
    });

    const event = await adapter.handleWebhookRequest(mockRequest);
    expect(event).toEqual(mockEvent);
    expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
      expect.any(String),
      "test_signature",
      webhookSecret,
    );
  });

  it("should throw error when stripe-signature is missing", async () => {
    const adapter = new StripeAdapter({
      client: mockStripe,
      webhookSecret,
    });

    // Create a mock request without signature
    const mockRequest = new Request("https://api.example.com/webhook", {
      method: "POST",
      body: JSON.stringify({ data: "test" }),
    });

    await expect(adapter.handleWebhookRequest(mockRequest)).rejects.toThrow(
      "missing stripe-signature",
    );
  });

  it("should integrate with X framework", () => {
    const x = createX()
      .syncAdapter(
        "stripe",
        () => new StripeAdapter({ client: mockStripe, webhookSecret }),
      )
      .build();

    expect(x._.adapters.stripe).toBeInstanceOf(StripeAdapter);
    expect(x.stripe.client).toBe(mockStripe);

    // Verify that Stripe methods are accessible
    expect(typeof x.stripe.client.paymentIntents.create).toBe("function");
    expect(typeof x.stripe.client.customers.create).toBe("function");
    expect(typeof x.stripe.client.webhooks.constructEvent).toBe("function");
  });
});
