# X Framework

X is a framework for composing production ready applications in Node.js.

It is a lightweight **un-opinionated** framework of pluggable modules, allowing you to continue to use your favorite libraries while having a common interface to improve developer experience.

## Example

```ts
import { XFramework } from "@xframework/core";
import { createDrizzleModule } from "@xframework/db/drizzle";
import { createAuthJsModule } from "@xframework/auth/auth-js/next";
import { createStripeModule } from "@xframework/payment/stripe";

export const x = new XFramework()
  .module("db", () => new DrizzleModule(db))
  .module("auth", () => new AuthJsModule(auth))
  .module("mailer", () => new NodemailerModule(mailer))
  .module(
    "stripe",
    () =>
      new StripeModule({
        apiKey,
        webhooks: {
          onCustomerCreated() {
            // ...
          },
        },
      }),
  )
  .module("next", () => new NextModule())
  // ... and more ...
  .build();

// Usage
const users = x.db.select().from(users);
const currentUser = await x.auth();
const customer = await x.stripe.client.customers.retrieve(
  currentUser.customerId,
);
```

## Getting Started

All of the documentation is available on the [X website](https://xframework.dev)
