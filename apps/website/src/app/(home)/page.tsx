import Link from "next/link";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";

export default function HomePage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="max-w-4xl text-center">
        <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-[#FF4D4D] to-[#9D4EDD] bg-clip-text text-transparent">
            X
          </span>{" "}
          Framework
        </h1>
        <p className="mt-4 text-lg text-fd-muted-foreground md:text-xl">
          The modern Node.js framework that embraces ecosystem freedom
        </p>
        <p className="mt-2 text-base text-fd-muted-foreground/80">
          Use any database, auth, or API layer you love - X adapts to your
          stack, not the other way around
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/docs"
            className="rounded-lg bg-fd-primary px-4 py-2 font-semibold text-fd-primary-foreground hover:bg-fd-primary/90"
          >
            Get Started
          </Link>
          <Link
            href="https://github.com/ludicroushq/x"
            className="rounded-lg border border-fd-border bg-fd-background px-4 py-2 font-semibold text-fd-foreground hover:bg-fd-muted/50"
          >
            GitHub
          </Link>
        </div>

        <div className="mt-12 overflow-hidden rounded-lg border border-fd-border bg-gradient-to-b from-fd-card to-fd-card/95 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
              <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
              <div className="h-3 w-3 rounded-full bg-[#27C93F]" />
            </div>
            <div className="text-xs text-fd-muted-foreground">x.ts</div>
          </div>
          <div className="mt-4 text-left">
            <DynamicCodeBlock
              lang="ts"
              className="text-sm"
              code={`import { createX } from '@xframework/x';

export const x = createX()
  .syncAdapter('hono', () => new HonoAdapter(hono))
  .syncAdapter('db', () => new DrizzleAdapter(drizzle))
  .syncAdapter('stripe', () => new StripeAdapter(stripe))
  .syncAdapter('auth', () => new BetterAuthAdapter(auth))
  .syncAdapter('logger', () => new LogTapeAdapter(logTape));`}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
