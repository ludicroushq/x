import { SyncAdapter } from "x/adapter";

export class StripeAdapter<
  UserStripeInstance extends Stripe,
> extends SyncAdapter<UserStripeInstance> {
  public app: UserStripeInstance;
  constructor({ app }: { app: UserStripeInstance, deps: { hono?: } }) {
    super();
    this.app = app;
  }

  export() {
    return this.app;
  }
}
