import type Stripe from "stripe";
import { SyncAdapter } from "@xframework/x/adapter";

export class StripeAdapter<
  UserStripeInstance extends Stripe,
> extends SyncAdapter<{
  client: UserStripeInstance;
}> {
  public client: UserStripeInstance;
  private webhookSecret: string;

  constructor({
    client,
    webhookSecret,
  }: {
    client: UserStripeInstance;
    webhookSecret: string;
  }) {
    super();
    this.client = client;
    this.webhookSecret = webhookSecret;
  }

  async handleWebhookRequest(request: Request) {
    const headers = request.headers;
    const body = await request.text();

    const signature = headers.get("stripe-signature");

    if (!signature) {
      throw new Error("missing stripe-signature");
    }

    const event = this.client.webhooks.constructEvent(
      body,
      signature,
      this.webhookSecret,
    );

    return event;
  }

  export() {
    return {
      client: this.client,
    };
  }
}
