# X Framework

X is a framework for composing production ready applications in Node.js.

It is a lightweight **un-opinionated** framework of pluggable modules, allowing you to continue to use your favorite libraries while having a common interface to improve developer experience.

## Example

```ts
import { X } from "@xframework/next";
import { createDrizzleModule } from "@xframework/db/drizzle";
import { createAuthJsModule } from "@xframework/auth/auth-js/next";
import { createStripeModule } from "@xframework/payment/stripe";

export const x = X({
  modules: {
    db: createDrizzleModule(db),
    auth: createAuthJsModule(authConfig),
    stripe: createStripeModule({
      apiKey,
      webhooks: {
        onCustomerCreated() {
          // ...
        },
      },
    }),
    // ... and more ...
  },
});

// Usage
const users = x.db.select().from(users);
const currentUser = await x.auth();
const customer = await x.stripe.client.customers.retrieve(
  currentUser.customerId,
);
```

## Getting Started

All of the documentation is available on the [X website](https://xframework.dev)
